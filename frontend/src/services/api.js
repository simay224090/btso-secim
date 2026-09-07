const API_URL = 'http://localhost:5249/api/Firma';

export const getFirmalar = async (komiteNo = '') => {
  const url = komiteNo ? `${API_URL}?komiteNo=${komiteNo}` : API_URL;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Veriler çekilemedi');
  return response.json();
};

export const updateFirmaDurumu = async (id, guncelVeri) => {
  const response = await fetch(`http://localhost:5249/api/Firma/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(guncelVeri),
  });

  if (!response.ok) {
    throw new Error('Güncelleme başarısız');
  }
  
  // Eğer API json döndürmüyorsa hata vermemesi için text olarak da kontrol edilebilir
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};