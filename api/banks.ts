import { VercelRequest, VercelResponse } from '@vercel/node';

const banks = [
    {
        codigo_banco: "0102",
        nombre_banco: "Banco de Venezuela",
        nombre_completo: "Banco de Venezuela, S.A. Banco Universal",
        nombre_corto: "BDV",
        rif: "G200099976",
        url: "http://www.bancodevenezuela.com/",
        logo: "https://www.bancodevenezuela.com/wp-content/uploads/2022/07/cropped-popup-192x192.png"
    },
    {
        codigo_banco: "0104",
        nombre_banco: "Banco Venezolano de Crédito",
        nombre_completo: "Venezolano de Crédito, S.A. Banco Universal",
        nombre_corto: "BVC",
        rif: "J000029709",
        url: "http://www.venezolano.com/",
        logo: "https://www.venezolano.com/favicon.ico"
    },
    {
        codigo_banco: "0105",
        nombre_banco: "Mercantil Banco",
        nombre_completo: "Banco Mercantil, C.A. Banco Universal",
        nombre_corto: "Mercantil",
        rif: "J000029610",
        url: "https://www.mercantilbanco.com/",
        logo: "https://www.mercantilbanco.com/favicon.ico"
    },
    {
        codigo_banco: "0108",
        nombre_banco: "BBVA Provincial",
        nombre_completo: "Banco Provincial, S.A. Banco Universal",
        nombre_corto: "Provincial",
        rif: "J000029679",
        url: "https://www.provincial.com/",
        logo: "https://www.provincial.com/favicon.ico"
    },
    {
        codigo_banco: "0114",
        nombre_banco: "Bancaribe",
        nombre_completo: "Banco del Caribe, C.A. Banco Universal",
        nombre_corto: "Bancaribe",
        rif: "J000029490",
        url: "https://www.bancaribe.com.ve/",
        logo: "https://d3olc33sy92l9e.cloudfront.net/wp-content/themes/bancaribe/images/bancaribe.ico.gzip"
    },
    {
        codigo_banco: "0115",
        nombre_banco: "Banco Exterior",
        nombre_completo: "Banco Exterior, C.A. Banco Universal",
        nombre_corto: "Exterior",
        rif: "J000029504",
        url: "http://www.bancoexterior.com/",
        logo: "https://www.bancoexterior.com/favicon.ico"
    },
    {
        codigo_banco: "0128",
        nombre_banco: "Banco Caroní",
        nombre_completo: "Banco Caroni, C.A. Banco Universal",
        nombre_corto: "Caroní",
        rif: "J095048551",
        url: "http://www.bancocaroni.com.ve/",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBFh651MullKL_UxZ-WJCqMx2DeWJ5jci6VQ&s"
    },
    {
        codigo_banco: "0134",
        nombre_banco: "Banesco",
        nombre_completo: "Banesco Banco Universal, C.A",
        nombre_corto: "Banesco",
        rif: "J070133805",
        url: "http://www.banesco.com/",
        logo: "https://www.banesco.com/favicon.ico"
    },
    {
        codigo_banco: "0137",
        nombre_banco: "Banco Sofitasa",
        nombre_completo: "Banco Sofitasa Banco Universal, C. A",
        nombre_corto: "Sofitasa",
        rif: "J090283846",
        url: "http://www.sofitasa.com/",
        logo: "https://www.sofitasa.com/assets/img/logo_favicon.png"
    },
    {
        codigo_banco: "0138",
        nombre_banco: "Banco Plaza",
        nombre_completo: "Banco Plaza, C.A. Banco Universal",
        nombre_corto: "Plaza",
        rif: "J002970553",
        url: "http://www.bancoplaza.com/",
        logo: "https://plazacdn-qa.s3.amazonaws.com/wp-content/themes/bancoplaza/imagenes/favicons/apple-icon-57x57.png"
    },
    {
        codigo_banco: "0146",
        nombre_banco: "Banco de la Gente Emprendedora",
        nombre_completo: "Banco de la Gente Emprendedora (BANGENTE), C.A",
        nombre_corto: "Bangente",
        rif: "J301442040",
        url: "http://www.bangente.com.ve/",
        logo: "https://cdn.prod.website-files.com/62f529f04efd72e0638343dd/66bb6c77405934492f78b2e3_G-04.png"
    },
    {
        codigo_banco: "0151",
        nombre_banco: "Banco Fondo Común",
        nombre_completo: "BFC Banco Fondo Común C.A. Banco Universal",
        nombre_corto: "BFC",
        rif: "J000723060",
        url: "https://www.bfc.com.ve/",
        logo: "https://www.bfc.com.ve/favicon.ico"
    },
    {
        codigo_banco: "0156",
        nombre_banco: "100% Banco",
        nombre_completo: "100% Banco, Banco Universal C.A.",
        nombre_corto: "100% Banco",
        rif: "J085007768",
        url: "http://www.100x100banco.com/",
        logo: "https://100x100banco.com/img/apple-touch-icon-57x57.png"
    },
    {
        codigo_banco: "0157",
        nombre_banco: "DelSur",
        nombre_completo: "DelSur Banco Universal, C.A.",
        nombre_corto: "DelSur",
        rif: "J000797234",
        url: "http://www.delsur.com.ve/",
        logo: "https://www.delsur.com.ve/favicon.ico"
    },
    {
        codigo_banco: "0163",
        nombre_banco: "Banco del Tesoro",
        nombre_completo: "Banco del Tesoro, C.A. Banco Universal",
        nombre_corto: "Tesoro",
        rif: "G200051876",
        url: "http://www.bt.com.ve/",
        logo: "https://www.bt.com.ve/wp-content/uploads/2025/10/cropped-Favicon-Banco-del-Tesoro-2025-180x180.jpeg"
    },
    {
        codigo_banco: "0168",
        nombre_banco: "Bancrecer",
        nombre_completo: "Bancrecer S.A. Banco Microfinanciero",
        nombre_corto: "Bancrecer",
        rif: "J316374173",
        url: "https://www.bancrecer.com.ve/",
        logo: "https://www.bancrecer.com.ve/images/img/bancrecer.ico"
    },
    {
        codigo_banco: "0169",
        nombre_banco: "Mi Banco",
        nombre_completo: "Mi Banco, Banco Microfinanciero C.A.",
        nombre_corto: "Mi Banco",
        rif: "J315941023",
        url: "http://www.mibanco.com.ve/",
        logo: "https://www.mibanco.com.ve/favicon.ico"
    },
    {
        codigo_banco: "0171",
        nombre_banco: "Banco Activo",
        nombre_completo: "Banco Activo C.A. Banco Universal",
        nombre_corto: "Activo",
        rif: "J080066227",
        url: "http://www.bancoactivo.com/",
        logo: "https://www.bancoactivo.com/favicon.ico"
    },
    {
        codigo_banco: "0172",
        nombre_banco: "Bancamiga",
        nombre_completo: "Bancamiga Banco Universal, C.A.",
        nombre_corto: "Bancamiga",
        rif: "J316287599",
        url: "http://www.bancamiga.com/",
        logo: "https://play-lh.googleusercontent.com/nkWlKYIleZGfk187C2qMLMLxtLOCmJbMGzZlzZboZLX1tZqkBSKHzsmw9yGaVlEAfA"
    },
    {
        codigo_banco: "0174",
        nombre_banco: "Banplus",
        nombre_completo: "Banplus Banco Universal, C.A",
        nombre_corto: "Banplus",
        rif: "J000423032",
        url: "http://www.banplus.com/",
        logo: "https://www.banplus.com/favicon.ico"
    },
    {
        codigo_banco: "0175",
        nombre_banco: "Banco Digital de los Trabajadores",
        nombre_completo: "Banco Digital de los Trabajadores Banco Universal C.A.",
        nombre_corto: "BDT",
        rif: "G200091487",
        url: "https://www.bdt.com.ve/",
        logo: "https://www.bdt.com.ve/wp-content/uploads/2024/06/cropped-FAVICON-3-180x180.png"
    },
    {
        codigo_banco: "0177",
        nombre_banco: "Banco de la Fuerza Armada Nacional Bolivariana",
        nombre_completo: "Banco de la Fuerza Armada Nacional Bolivariana Bco Universal",
        nombre_corto: "BANFANB",
        rif: "G200106573",
        url: "http://www.banfanb.com.ve/",
        logo: "https://play-lh.googleusercontent.com/X5SpWkAnZj55tGdvNNexLmGXb0D0f3wDqse52bRxHjBXtceF3hs5vT6hZe0gEESZwNU"
    },
    {
        codigo_banco: "0178",
        nombre_banco: "N58 Banco Digital",
        nombre_completo: "N58 Banco Digital, Banco Microfinanciero, S.A.",
        nombre_corto: "N58",
        rif: "",
        url: "https://www.n58bancodigital.com",
        logo: "https://cdn.prod.website-files.com/6503606066f5f3465fe0c9bc/6851eb3a456a4fc8ee467562_n58-webclip.png"
    },
    {
        codigo_banco: "0191",
        nombre_banco: "Banco Nacional de Crédito",
        nombre_completo: "Banco Nacional de Crédito, C.A. Banco Universal",
        nombre_corto: "BNC",
        rif: "J309841327",
        url: "http://www.bnc.com.ve/",
        logo: "https://d1uubxdj0phgsa.cloudfront.net/favicon.ico?v=1"
    },
    {
        codigo_banco: "0601",
        nombre_banco: "Instituto Municipal de Crédito Popular",
        nombre_completo: "Instituto Municipal de Crédito Popular",
        nombre_corto: "IMCP",
        rif: "G200068973",
        url: "http://www.imcp.gob.ve/",
        logo: "https://www.imcpbdc.com.ve/src/assets/Img/LogoStar.svg"
    }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Configuración de Respuesta 🏦
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'); // Cache 24h

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    return res.status(200).json(banks);
}
