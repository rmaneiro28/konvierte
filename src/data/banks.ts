import banksData from './venezuela_banks.json';

export interface Bank {
    code: string;
    name: string;
    legalName?: string;
    shortName?: string;
    rif?: string;
    url?: string;
    logo: string;
    color?: string;
    active?: number;
}

export const VENEZUELA_BANKS: Bank[] = (banksData as any[]).map(b => ({
    code: b.codigo_banco,
    name: b.nombre_banco,
    legalName: b.nombre_completo,
    shortName: b.nombre_corto,
    rif: b.rif,
    url: b.url,
    logo: b.logo,
    active: b.active !== undefined ? b.active : 1
}));

export const getBankByCode = (code: string) => {
    return VENEZUELA_BANKS.find(bank => bank.code === code);
};

export const getBankByName = (name: string) => {
    return VENEZUELA_BANKS.find(bank => bank.name === name);
};
