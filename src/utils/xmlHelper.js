import { XMLParser, XMLBuilder } from 'fast-xml-parser';
// XMLParser é usado para converter XML em objetos JavaScript
// XMLBuilder é usado para converter objetos JavaScript em XML.

const parser = new XMLParser();
const builder = new XMLBuilder({ arrayNodeName: 'item' });
// arrayNodeName é uma opção que define o nome do nó para arrays, facilitando a conversão de objetos com listas para XML.
const handlers = {
    Date: (v) => v.toISOString(), // DateTime = Date
    // toISOString() converte a data para o formato ISO 8601, que é um padrão em XML e JSON.
    Decimal: (v) => v.toString(), // Decimal = Decimal (decimal.js)
    Decimal2: (v) => v.toString(), // Decimal2 = Decimal (decimal.js)
    Buffer: (v) => v.toString('base64'), // Bytes = Buffer
    Uint8Array: (v) => Buffer.from(v).toString('base64'), // Bytes = Uint8Array
    // Usado para fotos, arquivos, imagens, assinatura digitais e chavves criptograficas, que são armazenados como bytes no banco de dados. O XML não suporta tipos binários, então eles são convertidos para strings em base64, que é um formato de texto seguro para transmitir dados binários.
};
// Converte recursivamente todos os tipos especiais do Prisma em primitivos que o XMLBuilder consegue processar
const sanitize = (data) => {
    if (Array.isArray(data)) return data.map(sanitize); // array → percorre cada item recursivamente
    if (typeof data === 'bigint') return data.toString(); // BigInt → string pois XML não suporta BigInt

    if (data === null || typeof data !== 'object') return data; // primitivo (string, number, boolean, null) → retorna como está

    const handler = handlers[data.constructor?.name]; // busca conversor pelo nome do tipo (ex: "Decimal")
    if (handler) return handler(data); // tipo especial encontrado → converte

    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, sanitize(v)])); // objeto comum → percorre cada chave recursivamente
};

export const xmlToObj = (xml) => {
    const result = parser.parse(xml);
    // parser.parse() é o método que realiza a conversão de XML para um objeto JavaScript.
    // O resultado é um objeto que representa a estrutura do XML.
    return result && result.item ? result.item : {};
    // exemplo é o nome do nó raiz esperado no XML. Ele se chama exemplo porque o XML de entrada deve ter uma estrutura como <exemplo>...</exemplo>.
};

export const objToXml = (data) => builder.build({ item: sanitize(data) });
// builder.build() é o método que converte um objeto JavaScript em XML.
// exemplo é o nome do nó raiz que envolverá os dados convertidos em XML.

export const sendXml = (res, status, data) =>
    res.status(status).set('Content-Type', 'application/xml').send(objToXml(data));
// Content-Type é definido como application/xml para indicar que a resposta é em formato XML.

/* No Postman:
 *
 * Body → raw → XML
 * Header Content-Type: application/xml
 */
