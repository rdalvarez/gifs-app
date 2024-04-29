import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Gif, SearchResponce } from '../interfaces/gifs.interfaces';

const GIPHY_API_KEY = 'FgHEGK9sZRvg1LbF8xVZFzTbFriyHocm';
const GIPHY_URL = 'https://api.giphy.com/v1/gifs';

@Injectable({
  providedIn: 'root',
})
export class GifsService {
  public gifList: Gif[] = [];

  private _tagsHistory: string[] = [];

  constructor(private http: HttpClient) {
    this.loadLocalSotrage();
    console.log('Gifs Service Ready');
  }

  public get tagsHistory(): string[] {
    return [...this._tagsHistory];
  }

  private organizeHistory(tag: string) {
    // Es mas facil al comprar todo en minuscula
    tag = tag.toLocaleLowerCase();
    // Preguntamos si el tag ya esta incluido para eliminarlo
    if (this._tagsHistory.includes(tag)) {
      // El filtro me sirve para devolver un nuevo arreglo pero con una condicion
      this._tagsHistory = this._tagsHistory.filter((oldTag) => oldTag != tag);
    }
    // Este inserta el nuevo elemento al inicio
    this._tagsHistory.unshift(tag);
    // Ahora corto el arreglo hasta 10 elementos para mantener un top 10 en mi lista
    this._tagsHistory = this._tagsHistory.splice(0, 10);

    this.saveLogalStorage();
  }

  /**
   * Recuperamos la informacion guardada en el LocalStorage
   */
  public loadLocalSotrage() {
    if (!localStorage.getItem('history')) return;
    this._tagsHistory = JSON.parse(localStorage.getItem('history')!) || [];

    if (this._tagsHistory.length === 0) return;
    this.searchTag(this._tagsHistory[0]);
  }

  /**
   *  Guardamos la informaicon en el LocalStorage
   */
  private saveLogalStorage() {
    localStorage.setItem('history', JSON.stringify(this._tagsHistory));
  }

  async searchTag(tag: string): Promise<void> {
    if (tag.length === 0) return;

    this.organizeHistory(tag);

    const params = new HttpParams()
      .set('api_key', GIPHY_API_KEY)
      .set('limit', '10')
      .set('q', tag);

    this.http
      .get<SearchResponce>(`${GIPHY_URL}/search`, { params: params })
      .subscribe((resp) => {
        this.gifList = resp.data;
      });
  }
}
