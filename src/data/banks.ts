export interface Bank {
    code: string;
    name: string;
    logo: string;
    color: string;
}

export const VENEZUELA_BANKS: Bank[] = [
    {
        code: '0102',
        name: 'Banco de Venezuela',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Banco_de_Venezuela_logo.svg',
        color: '#BD0000'
    },
    {
        code: '0134',
        name: 'Banesco',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Banesco_Logo.svg',
        color: '#2C8B3E'
    },
    {
        code: '0105',
        name: 'Banco Mercantil',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Banco_Mercantil_%28Venezuela%29_logo.svg',
        color: '#005596'
    },
    {
        code: '0108',
        name: 'BBVA Provincial',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/BBVA_2019.svg',
        color: '#004481'
    },
    {
        code: '0191',
        name: 'BNC (Banco Nacional de Crédito)',
        logo: 'https://seeklogo.com/images/B/bnc-banco-nacional-de-credito-logo-4E3F402C82-seeklogo.com.png',
        color: '#00A651'
    },
    {
        code: '0114',
        name: 'Bancaribe',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Bancaribe-logo.png',
        color: '#0054A6'
    },
    {
        code: '0172',
        name: 'Bancamiga',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Bancamiga.png',
        color: '#0066B3'
    },
    {
        code: '0171',
        name: 'Banco Activo',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Banco_Activo.png',
        color: '#C6D800'
    },
    {
        code: '0151',
        name: 'Banco Fondo Común (BFC)',
        logo: 'https://seeklogo.com/images/B/bfc-banco-fondo-comun-logo-302CE657C6-seeklogo.com.png',
        color: '#8DC63F'
    },
    {
        code: '0175',
        name: 'Banco Bicentenario',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Banco_Bicentenario.png',
        color: '#D42E12'
    },
    {
        code: '0128',
        name: 'Banco Caroní',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Banco-Caron%C3%AD-logo.png',
        color: '#0072CE'
    },
    {
        code: '0115',
        name: 'Banco Exterior',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Banco-Exterior-VE-logo.png',
        color: '#00B0AD'
    },
    {
        code: '0163',
        name: 'Banco del Tesoro',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Bt-logo-new.png/410px-Bt-logo-new.png',
        color: '#005CAA'
    },
    {
        code: '0137',
        name: 'Sofitasa',
        logo: 'https://seeklogo.com/images/B/banco-sofitasa-logo-D49C52E4B8-seeklogo.com.png',
        color: '#004A99'
    },
    {
        code: '0174',
        name: 'Banplus',
        logo: 'https://seeklogo.com/images/B/banplus-logo-F986A1D2D5-seeklogo.com.png',
        color: '#84C341'
    },
    {
        code: '0157',
        name: '100% Banco',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/100%25_Banco_logo.png',
        color: '#FFCC00'
    },
    {
        code: '0169',
        name: 'Mi Banco',
        logo: '',
        color: '#0054A6'
    },
    {
        code: '0166',
        name: 'Banco Agrícola de Venezuela',
        logo: '',
        color: '#F39200'
    }
];

export const getBankByCode = (code: string) => {
    return VENEZUELA_BANKS.find(bank => bank.code === code);
};

export const getBankByName = (name: string) => {
    return VENEZUELA_BANKS.find(bank => bank.name === name);
};
