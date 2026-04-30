// @ts-ignore
declare const google: any;

const SCOPE = 'https://www.googleapis.com/auth/youtube.upload';

// 必須由使用者提供他們的 Client ID
// 這邊我們先設計一個方法來儲存/讀取 Client ID
export const getClientId = () => localStorage.getItem('YOUTUBE_CLIENT_ID') || '';
export const setClientId = (id: string) => localStorage.setItem('YOUTUBE_CLIENT_ID', id);

export const authenticateYouTube = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const clientId = getClientId();
    if (!clientId) {
      reject(new Error('請先在設定中輸入您的 Google Client ID'));
      return;
    }

    if (typeof google === 'undefined' || !google.accounts) {
      reject(new Error('Google 授權套件載入失敗，請檢查網路連線'));
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPE,
        callback: (response: any) => {
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } catch (e) {
      reject(e);
    }
  });
};

export const uploadVideoToYouTube = async (file: File, accessToken: string, title: string, description: string = ''): Promise<string> => {
  // 1. Initial request to get upload URL (Resumable Upload)
  const metadata = {
    snippet: {
      title,
      description,
      categoryId: '22' // Autos & Vehicles
    },
    status: {
      privacyStatus: 'unlisted', // 不公開
      selfDeclaredMadeForKids: false
    }
  };

  const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Length': file.size.toString(),
      'X-Upload-Content-Type': file.type
    },
    body: JSON.stringify(metadata)
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    console.error('初始化上傳失敗:', errText);
    throw new Error('初始化上傳失敗 (可能是配額已滿，一天限制6部)');
  }

  const uploadUrl = initRes.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('無法取得上傳網址');
  }

  // 2. Upload actual video file
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Length': file.size.toString(),
      'Content-Type': file.type
    },
    body: file
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error('影片上傳失敗:', errText);
    throw new Error('影片上傳失敗');
  }

  const data = await uploadRes.json();
  return data.id; // 返回 YouTube Video ID
};
