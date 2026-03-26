import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

import { getCoordinatesFromSearch } from './getCoordinatesFromSearch';

describe('getCoordinatesFromSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait retourner les coordonnées avec un résultat valide', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        features: [{ geometry: { coordinates: [2.3522, 48.8566] } }],
      },
    });

    const result = await getCoordinatesFromSearch('Paris');
    expect(result).toEqual({ lng: 2.3522, lat: 48.8566 });
    expect(mockedAxios.get).toHaveBeenCalledOnce();
  });

  it('devrait retourner null si features est vide', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { features: [] },
    });

    const result = await getCoordinatesFromSearch('xyznonexistent');
    expect(result).toBeNull();
  });

  it('devrait retourner null en cas d\'erreur réseau', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    const result = await getCoordinatesFromSearch('Paris');
    expect(result).toBeNull();
  });

  it('devrait retourner null si la réponse est malformée', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { something: 'else' },
    });

    const result = await getCoordinatesFromSearch('Paris');
    expect(result).toBeNull();
  });

  it('devrait encoder le searchWord dans l\'URL', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { features: [] },
    });

    await getCoordinatesFromSearch('rue de la paix');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('rue%20de%20la%20paix'),
    );
  });
});
