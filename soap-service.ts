import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoapService {
  public host = ''; 
  public port = 80;
  public pathToAsmx = ''; 
  public namespace = ''; 

  constructor() {

  }

  async send(command: string, jsonObject: Object, isListOf: string): Promise<string> {
    const xmlhttp = new XMLHttpRequest();
    const url = 'http://' + this.host + ':' + this.port + this.pathToAsmx;
    xmlhttp.open('POST', url, true);
    
    const parameters = this.buildParameters(jsonObject);

    // The following variable contains the xml SOAP request.
    const sr = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
        xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <` + command + ` xmlns="` + this.namespace + `">
          ` + parameters + `
        </` + command + `>
      </soap12:Body>
    </soap12:Envelope>`;

    // console.log('SENDING', sr);
    
    const p = new Promise<string>((resolve) => { 
      xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {

              const xml = xmlhttp.responseXML;
              
              let responseString: string;

              if (isListOf)
              {
                responseString = this.getResponseStringList(xml
                  .getElementsByTagName(command + 'Result')[0].outerHTML, 
                  isListOf);
              } else {
                responseString = xml
                  .getElementsByTagName(command + 'Result')[0]
                  .innerHTML;
              }
              
              resolve(responseString);
            }
          }
        };
    });

    // Send the POST request.
    xmlhttp.setRequestHeader('Content-Type', 'application/soap+xml; charset=utf-8');
    xmlhttp.responseType = 'document';
    xmlhttp.send(sr);

    return p;
  }

  getResponseStringList(xml: string, isListOf: string): string {
    const arr = [];

    // Use JQuery to help me dig through the crap.
    let e = $(xml).find(isListOf);

    for (var x=0; x<e.length; x++) {
      arr.push(e[x].innerText);
    }

    return JSON.stringify(arr);
  }

  

  buildParameters(j: Object): string {
    let ret = '';

    const keys = Object.keys(j);
    keys.forEach((k) => {
      ret += '<' + k + '>' + j[k] + '</' + k + '>\r\n'; 
    });

    return ret;
  }
}
