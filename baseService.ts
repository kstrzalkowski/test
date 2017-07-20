import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class BaseHttpService {

    protected options = new RequestOptions({
  	    headers: new Headers({'Content-Type': 'application/json', withCredentials: true})
	});

    constructor(protected http: Http, withToken: boolean = true) { 
        if(withToken) {
            this.options.headers.append('Authorization', 'Bearer ' + localStorage.getItem('id_token'));
        }  
    }  

    protected handleError(error: any) {
        let errMsg = (error.message) ? error.message :	
            error.status ? `${error.status} - ${error.statusText}` : 'Other error.';

        let description: string;

        switch (error.status) {
            case 0:
                description = 'Błąd połączenia z serwerem.';
                break;		

            case 400:
                description = 'Bad request.'
                this.getModelStates(error);
                break;

            case 401:
                description = 'Nie jesteś autoryzowany do używania tej usługi.'
                break;

            case 403:
                description = 'Nie posiadasz uprawnień do tej części systemu.';	
                break;

            case 500:
                description = 'Wewnętrzny błąd serwera.';
                break;

            default:
                description = 'Wystapił nieobsłużony błąd.';
                break;
        }

        console.log(error);
        return Observable.throw({description: description, status: error.status, details: errMsg});
    }

    private getModelStates(error :any) {
        console.log('getModelStates()');
        let obj = JSON.parse(error._body);
        let result = [];

        for(let val in obj.modelState) {
            for(let a of obj.modelState[val]) {
                result.push(a);
            }
        }
        return result;
    }
}

// Funkcja wywołująca:
// .catch(err => this.handleError(err));
// 
get() {
    return this.http.get('http://ws.propcard.pl/api/Account/UserInfo', this.options)
      .map(a=>a.json())
      .catch(err => this.handleError(err));
  }
