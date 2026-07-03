/*
 EventFlow Database v1.0 - MySQL
 Ręcznie przygotowany szablon bazy danych.
 Standard:
 - każde id: INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
 - id_organizacji zamiast id_firmy
 - brak ENUM tam, gdzie statusy/typy mogą być edytowane przez organizację
 - aktywny, data_utworzenia, data_aktualizacji, data_usuniecia w tabelach biznesowych
*/

DROP DATABASE IF EXISTS eventflow_v1;
CREATE DATABASE eventflow_v1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventflow_v1;

-- =========================================================
-- CORE
-- =========================================================

CREATE TABLE organizacje (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nazwa VARCHAR(255) NOT NULL,
    subdomena VARCHAR(100) NOT NULL,
    nip CHAR(10) NULL,
    regon CHAR(14) NULL,
    krs CHAR(10) NULL,
    email VARCHAR(150) NULL,
    telefon VARCHAR(30) NULL,
    ulica VARCHAR(150) NULL,
    kod_pocztowy VARCHAR(10) NULL,
    miasto VARCHAR(100) NULL,
    kraj VARCHAR(100) NOT NULL DEFAULT 'Polska',
    status VARCHAR(50) NOT NULL DEFAULT 'aktywna',
    plan_abonamentu VARCHAR(100) NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    UNIQUE KEY uq_organizacje_subdomena (subdomena),
    UNIQUE KEY uq_organizacje_nip (nip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(100) NOT NULL,
    opis TEXT NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_role_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    UNIQUE KEY uq_role_nazwa_org (id_organizacji, nazwa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE uzytkownicy (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    imie VARCHAR(100) NOT NULL,
    nazwisko VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefon VARCHAR(30) NULL,
    haslo VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) NULL, -- Zmiana z BLOB na URL/ścieżkę
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_ostatniego_logowania DATETIME NULL,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_uzytkownicy_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    UNIQUE KEY uq_uzytkownicy_email_org (id_organizacji, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE uzytkownicy_role (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_uzytkownika INT UNSIGNED NOT NULL,
    id_roli INT UNSIGNED NOT NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_ur_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_ur_uzytkownicy FOREIGN KEY (id_uzytkownika) REFERENCES uzytkownicy(id),
    CONSTRAINT fk_ur_role FOREIGN KEY (id_roli) REFERENCES role(id),
    UNIQUE KEY uq_uzytkownik_rola (id_uzytkownika, id_roli)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- CRM
-- =========================================================

CREATE TABLE kontrahenci (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(255) NOT NULL,
    nazwa_skrocona VARCHAR(150) NULL,
    nip CHAR(10) NULL,
    regon CHAR(14) NULL,
    krs CHAR(10) NULL,
    ulica VARCHAR(150) NULL,
    nr_budynku VARCHAR(20) NULL,
    nr_lokalu VARCHAR(20) NULL,
    kod_pocztowy VARCHAR(10) NULL,
    miasto VARCHAR(100) NULL,
    kraj VARCHAR(100) NOT NULL DEFAULT 'Polska',
    email VARCHAR(150) NULL,
    telefon VARCHAR(30) NULL,
    uwagi TEXT NULL,
    zrodlo_danych VARCHAR(50) NOT NULL DEFAULT 'recznie',
    data_pobrania_gus DATETIME NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_kontrahenci_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    KEY idx_kontrahenci_nip (nip),
    KEY idx_kontrahenci_nazwa (nazwa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE kontakty_kontrahentow (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_kontrahenta INT UNSIGNED NOT NULL,
    imie VARCHAR(100) NULL,
    nazwisko VARCHAR(100) NULL,
    stanowisko VARCHAR(100) NULL,
    email VARCHAR(150) NULL,
    telefon VARCHAR(30) NULL,
    telefon_2 VARCHAR(30) NULL,
    notatki_wewnetrzne TEXT NULL,
    glowny BOOLEAN NOT NULL DEFAULT FALSE,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_kontakty_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_kontakty_kontrahenci FOREIGN KEY (id_kontrahenta) REFERENCES kontrahenci(id),
    KEY idx_kontakty_kontrahent (id_kontrahenta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE miejsca (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(255) NOT NULL,
    ulica VARCHAR(150) NULL,
    kod_pocztowy VARCHAR(10) NULL,
    miasto VARCHAR(100) NULL,
    kraj VARCHAR(100) NOT NULL DEFAULT 'Polska',
    opis TEXT NULL,
    notatki_wewnetrzne TEXT NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_miejsca_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- MAGAZYN
-- =========================================================

CREATE TABLE magazyny (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(100) NOT NULL,
    opis TEXT NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_magazyny_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    UNIQUE KEY uq_magazyny_nazwa_org (id_organizacji, nazwa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE kategorie (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_rodzica INT UNSIGNED NULL,
    nazwa VARCHAR(150) NOT NULL,
    opis TEXT NULL,
    kolor VARCHAR(20) NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_kategorie_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_kategorie_rodzic FOREIGN KEY (id_rodzica) REFERENCES kategorie(id),
    KEY idx_kategorie_rodzic (id_rodzica)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE modele (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_kategorii INT UNSIGNED NULL,
    nazwa VARCHAR(200) NOT NULL,
    producent VARCHAR(100) NULL,
    miejsce_w_mag VARCHAR(200) NULL,
    opis TEXT NULL,
    notatki_wewnetrzne TEXT NULL,
    widoczny_w_ofercie BOOLEAN NOT NULL DEFAULT TRUE,
    widoczny_w_mag BOOLEAN NOT NULL DEFAULT TRUE,
    szerokosc DECIMAL(10,2) NULL,
    wysokosc DECIMAL(10,2) NULL,
    glebokosc DECIMAL(10,2) NULL,
    objetosc DECIMAL(10,2) NULL,
    waga DECIMAL(10,2) NULL,
    wartosc DECIMAL(12,2) NULL,
    zdjecie VARCHAR(500) NULL, -- Zmiana z BLOB na URL/ścieżkę
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_modele_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_modele_kategorie FOREIGN KEY (id_kategorii) REFERENCES kategorie(id),
    KEY idx_modele_kategoria (id_kategorii),
    KEY idx_modele_nazwa (nazwa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE egzemplarze (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_modelu INT UNSIGNED NOT NULL,
    id_magazynu INT UNSIGNED NULL,
    nazwa VARCHAR(200) NULL,
    sn VARCHAR(200) NULL,
    qr_kod VARCHAR(255) NULL,
    kod_kreskowy VARCHAR(100) NULL,
    miejsce_w_mag VARCHAR(200) NULL,
    id_case INT UNSIGNED NULL,
    id_statusu_egzemplarza INT UNSIGNED NULL,
    szerokosc DECIMAL(10,2) NULL,
    wysokosc DECIMAL(10,2) NULL,
    glebokosc DECIMAL(10,2) NULL,
    objetosc DECIMAL(10,2) NULL,
    waga DECIMAL(10,2) NULL,
    wartosc DECIMAL(12,2) NULL,
    notatki_wewnetrzne TEXT NULL,
    zdjecie VARCHAR(500) NULL, -- Zmiana z BLOB na URL/ścieżkę
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_egzemplarze_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_egzemplarze_modele FOREIGN KEY (id_modelu) REFERENCES modele(id),
    CONSTRAINT fk_egzemplarze_magazyny FOREIGN KEY (id_magazynu) REFERENCES magazyny(id),
    KEY idx_egzemplarze_model (id_modelu),
    KEY idx_egzemplarze_sn (sn),
    KEY idx_egzemplarze_qr (qr_kod),
    KEY idx_egzemplarze_kod_kreskowy (kod_kreskowy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE egzemplarze
    ADD CONSTRAINT fk_egzemplarze_case FOREIGN KEY (id_case) REFERENCES egzemplarze(id);

CREATE TABLE cenniki (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(150) NOT NULL,
    domyslny BOOLEAN NOT NULL DEFAULT FALSE,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_cenniki_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    UNIQUE KEY uq_cenniki_nazwa_org (id_organizacji, nazwa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ceny_sprzetu (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_cennika INT UNSIGNED NOT NULL,
    id_modelu INT UNSIGNED NOT NULL,
    cena_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    vat DECIMAL(5,2) NOT NULL DEFAULT 23.00,
    procent_pierwszego_dnia DECIMAL(6,2) NOT NULL DEFAULT 100.00,
    przelicznik_kolejnych_dni DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_ceny_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_ceny_cenniki FOREIGN KEY (id_cennika) REFERENCES cenniki(id),
    CONSTRAINT fk_ceny_modele FOREIGN KEY (id_modelu) REFERENCES modele(id),
    UNIQUE KEY uq_ceny_cennik_model (id_cennika, id_modelu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- WYDARZENIA
-- =========================================================

CREATE TABLE typy_wydarzen (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(150) NOT NULL,
    kolor VARCHAR(20) NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_typy_wydarzen_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE statusy_wydarzen (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(150) NOT NULL,
    kolor VARCHAR(20) NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_statusy_wydarzen_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wydarzenia (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_typu_wydarzenia INT UNSIGNED NULL,
    id_statusu_wydarzenia INT UNSIGNED NULL,
    id_kontrahenta INT UNSIGNED NULL,
    id_kontaktu INT UNSIGNED NULL,
    id_miejsca INT UNSIGNED NULL,
    id_managera INT UNSIGNED NULL,
    nazwa VARCHAR(255) NOT NULL,
    numer VARCHAR(100) NULL,
    opis TEXT NULL,
    data_start DATETIME NULL,
    data_koniec DATETIME NULL,
    budzet_netto DECIMAL(12,2) NULL,
    budzet_brutto DECIMAL(12,2) NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_wydarzenia_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_wydarzenia_typy FOREIGN KEY (id_typu_wydarzenia) REFERENCES typy_wydarzen(id),
    CONSTRAINT fk_wydarzenia_statusy FOREIGN KEY (id_statusu_wydarzenia) REFERENCES statusy_wydarzen(id),
    CONSTRAINT fk_wydarzenia_kontrahenci FOREIGN KEY (id_kontrahenta) REFERENCES kontrahenci(id),
    CONSTRAINT fk_wydarzenia_kontakty FOREIGN KEY (id_kontaktu) REFERENCES kontakty_kontrahentow(id),
    CONSTRAINT fk_wydarzenia_miejsca FOREIGN KEY (id_miejsca) REFERENCES miejsca(id),
    CONSTRAINT fk_wydarzenia_manager FOREIGN KEY (id_managera) REFERENCES uzytkownicy(id),
    KEY idx_wydarzenia_datyrange (data_start, data_koniec)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE typy_etapow (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(150) NOT NULL,
    skrot VARCHAR(20) NULL,
    kolor VARCHAR(20) NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_typy_etapow_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE etapy_wydarzen (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_wydarzenia INT UNSIGNED NOT NULL,
    id_typu_etapu INT UNSIGNED NULL,
    nazwa VARCHAR(150) NOT NULL,
    data_start DATETIME NOT NULL,
    data_koniec DATETIME NOT NULL,
    opis TEXT NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_etapy_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_etapy_wydarzenia FOREIGN KEY (id_wydarzenia) REFERENCES wydarzenia(id),
    CONSTRAINT fk_etapy_typy FOREIGN KEY (id_typu_etapu) REFERENCES typy_etapow(id),
    KEY idx_etapy_wydarzenia (id_wydarzenia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- OFERTY
-- =========================================================

CREATE TABLE statusy_ofert (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(150) NOT NULL,
    kolor VARCHAR(20) NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_statusy_ofert_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE oferty (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_wydarzenia INT UNSIGNED NULL,
    id_kontrahenta INT UNSIGNED NULL,
    id_kontaktu INT UNSIGNED NULL,
    id_managera INT UNSIGNED NULL,
    id_cennika INT UNSIGNED NULL,
    id_statusu_oferty INT UNSIGNED NULL,
    numer VARCHAR(100) NULL,
    nazwa VARCHAR(255) NOT NULL,
    data_sporzadzenia DATE NULL,
    termin_platnosci_dni INT NOT NULL DEFAULT 14,
    budzet_netto DECIMAL(12,2) NULL,
    budzet_brutto DECIMAL(12,2) NULL,
    aktualna_wersja INT UNSIGNED NOT NULL DEFAULT 1,
    suma_przed_budzetem_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    rabat_budzetowy_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    rabat_budzetowy_proc DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
    suma_sprzet_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    suma_transport_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    suma_obsluga_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    suma_nocleg_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    suma_inne_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    suma_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    suma_vat DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    suma_brutto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    algorytm_budzetu VARCHAR(50) NOT NULL DEFAULT 'brak',
    blokada_cen BOOLEAN NOT NULL DEFAULT FALSE,
    warunki_zamowienia TEXT NULL,
    notatki_wewnetrzne TEXT NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_oferty_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_oferty_wydarzenia FOREIGN KEY (id_wydarzenia) REFERENCES wydarzenia(id),
    CONSTRAINT fk_oferty_kontrahenci FOREIGN KEY (id_kontrahenta) REFERENCES kontrahenci(id),
    CONSTRAINT fk_oferty_kontakty FOREIGN KEY (id_kontaktu) REFERENCES kontakty_kontrahentow(id),
    CONSTRAINT fk_oferty_manager FOREIGN KEY (id_managera) REFERENCES uzytkownicy(id),
    CONSTRAINT fk_oferty_cenniki FOREIGN KEY (id_cennika) REFERENCES cenniki(id),
    CONSTRAINT fk_oferty_status FOREIGN KEY (id_statusu_oferty) REFERENCES statusy_ofert(id),
    KEY idx_oferty_wydarzenie (id_wydarzenia),
    KEY idx_oferty_numer (numer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wersje_ofert (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_oferty INT UNSIGNED NOT NULL,
    numer_wersji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(255) NOT NULL,
    powod_zmiany TEXT NULL,
    suma_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    suma_vat DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    suma_brutto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    id_uzytkownika_utworzyl INT UNSIGNED NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_wo_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_wo_oferty FOREIGN KEY (id_oferty) REFERENCES oferty(id),
    CONSTRAINT fk_wo_uzytkownik FOREIGN KEY (id_uzytkownika_utworzyl) REFERENCES uzytkownicy(id),
    UNIQUE KEY uq_wersje_ofert (id_oferty, numer_wersji)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sekcje_oferty (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_wersji_oferty INT UNSIGNED NOT NULL, -- Powiązanie z wersją zamiast z główną ofertą
    nazwa VARCHAR(255) NOT NULL,
    opis TEXT NULL,
    kolor VARCHAR(20) NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    budzet_netto DECIMAL(12,2) NULL,
    suma_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    widoczna_w_pdf BOOLEAN NOT NULL DEFAULT TRUE,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_sekcje_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_sekcje_wersje FOREIGN KEY (id_wersji_oferty) REFERENCES wersje_ofert(id),
    KEY idx_sekcje_wersje (id_wersji_oferty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pozycje_oferty (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_wersji_oferty INT UNSIGNED NOT NULL, -- Powiązanie z wersją zamiast z główną ofertą
    id_sekcji INT UNSIGNED NULL,
    id_kategorii INT UNSIGNED NULL,
    id_modelu INT UNSIGNED NULL,
    id_ceny_sprzetu INT UNSIGNED NULL,
    typ_pozycji VARCHAR(50) NOT NULL DEFAULT 'sprzet',
    nazwa VARCHAR(255) NOT NULL,
    opis TEXT NULL,
    uwagi TEXT NULL,
    cena_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ilosc DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    dni_pracy DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    procent_pierwszego_dnia DECIMAL(6,2) NOT NULL DEFAULT 100.00,
    przelicznik DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    rabat_proc DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    rabat_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cena_przed_budzetem_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    rabat_budzetowy_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    vat DECIMAL(5,2) NOT NULL DEFAULT 23.00,
    razem_netto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    razem_vat DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    razem_brutto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    kolejnosc INT NOT NULL DEFAULT 0,
    widoczna_w_pdf BOOLEAN NOT NULL DEFAULT TRUE,
    zablokowana_przed_budzetem BOOLEAN NOT NULL DEFAULT FALSE,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_po_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_po_wersje FOREIGN KEY (id_wersji_oferty) REFERENCES wersje_ofert(id),
    CONSTRAINT fk_po_sekcje FOREIGN KEY (id_sekcji) REFERENCES sekcje_oferty(id),
    CONSTRAINT fk_po_kategorie FOREIGN KEY (id_kategorii) REFERENCES kategorie(id),
    CONSTRAINT fk_po_modele FOREIGN KEY (id_modelu) REFERENCES modele(id),
    CONSTRAINT fk_po_ceny FOREIGN KEY (id_ceny_sprzetu) REFERENCES ceny_sprzetu(id),
    KEY idx_pozycje_wersji (id_wersji_oferty),
    KEY idx_pozycje_sekcji (id_sekcji)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- WYNAJMY
-- =========================================================

CREATE TABLE statusy_wynajmow (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(150) NOT NULL,
    kolor VARCHAR(20) NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_statusy_wyn_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wynajmy (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_wydarzenia INT UNSIGNED NULL,
    id_oferty INT UNSIGNED NULL,
    id_kontrahenta INT UNSIGNED NULL,
    id_statusu_wynajmu INT UNSIGNED NULL,
    numer VARCHAR(100) NULL,
    data_wydania DATETIME NULL,
    data_zwrotu_planowana DATETIME NULL,
    data_zwrotu_rzeczywista DATETIME NULL,
    notatki_wewnetrzne TEXT NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_wynajmy_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_wynajmy_wydarzenia FOREIGN KEY (id_wydarzenia) REFERENCES wydarzenia(id),
    CONSTRAINT fk_wynajmy_oferty FOREIGN KEY (id_oferty) REFERENCES oferty(id),
    CONSTRAINT fk_wynajmy_kontrahenci FOREIGN KEY (id_kontrahenta) REFERENCES kontrahenci(id),
    CONSTRAINT fk_wynajmy_status FOREIGN KEY (id_statusu_wynajmu) REFERENCES statusy_wynajmow(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pozycje_wynajmu (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_wynajmu INT UNSIGNED NOT NULL,
    id_modelu INT UNSIGNED NOT NULL,
    id_egzemplarza INT UNSIGNED NULL,
    ilosc DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    notatki_wewnetrzne TEXT NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_pw_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_pw_wynajmy FOREIGN KEY (id_wynajmu) REFERENCES wynajmy(id),
    CONSTRAINT fk_pw_modele FOREIGN KEY (id_modelu) REFERENCES modele(id),
    CONSTRAINT fk_pw_egzemplarze FOREIGN KEY (id_egzemplarza) REFERENCES egzemplarze(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- SERWIS
-- =========================================================

CREATE TABLE statusy_serwisu (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    nazwa VARCHAR(150) NOT NULL,
    kolor VARCHAR(20) NULL,
    kolejnosc INT NOT NULL DEFAULT 0,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_statusy_serwisu_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE serwisy_sprzetu (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_egzemplarza INT UNSIGNED NOT NULL,
    id_statusu_serwisu INT UNSIGNED NOT NULL,
    id_uzytkownika_zglosil INT UNSIGNED NOT NULL,
    id_uzytkownika_rozwiazal INT UNSIGNED NULL,
    tytul VARCHAR(150) NOT NULL,
    opis TEXT NULL,
    rozwiazanie TEXT NULL,
    data_zgloszenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_rozwiazania DATETIME NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    CONSTRAINT fk_serwisy_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_serwisy_egzemplarze FOREIGN KEY (id_egzemplarza) REFERENCES egzemplarze(id),
    CONSTRAINT fk_serwisy_status FOREIGN KEY (id_statusu_serwisu) REFERENCES statusy_serwisu(id),
    CONSTRAINT fk_serwisy_zglosil FOREIGN KEY (id_uzytkownika_zglosil) REFERENCES uzytkownicy(id),
    CONSTRAINT fk_serwisy_rozwiazal FOREIGN KEY (id_uzytkownika_rozwiazal) REFERENCES uzytkownicy(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- SYSTEM
-- =========================================================

CREATE TABLE zalaczniki (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    typ_obiektu VARCHAR(100) NOT NULL,
    id_obiektu INT UNSIGNED NOT NULL,
    nazwa VARCHAR(255) NOT NULL,
    nazwa_pliku VARCHAR(255) NOT NULL,
    sciezka VARCHAR(500) NULL,
    mime VARCHAR(100) NULL,
    rozmiar_bajtow INT UNSIGNED NULL,
    id_uzytkownika_dodal INT UNSIGNED NULL,
    aktywny BOOLEAN NOT NULL DEFAULT TRUE,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_usuniecia DATETIME NULL,
    -- Usunięto kolumnę plik LONGBLOB
    CONSTRAINT fk_zalaczniki_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_zalaczniki_uzytkownicy FOREIGN KEY (id_uzytkownika_dodal) REFERENCES uzytkownicy(id),
    KEY idx_zalaczniki_obiekt (typ_obiektu, id_obiektu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE logi_zmian (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_organizacji INT UNSIGNED NOT NULL,
    id_uzytkownika INT UNSIGNED NULL,
    typ_obiektu VARCHAR(100) NOT NULL,
    id_obiektu INT UNSIGNED NULL,
    akcja VARCHAR(50) NOT NULL,
    pole VARCHAR(100) NULL,
    stara_wartosc TEXT NULL,
    nowa_wartosc TEXT NULL,
    ip VARCHAR(45) NULL,
    user_agent TEXT NULL,
    data_utworzenia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logi_organizacje FOREIGN KEY (id_organizacji) REFERENCES organizacje(id),
    CONSTRAINT fk_logi_uzytkownicy FOREIGN KEY (id_uzytkownika) REFERENCES uzytkownicy(id),
    KEY idx_logi_obiekt (typ_obiektu, id_obiektu),
    KEY idx_logi_data (data_utworzenia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- DANE STARTOWE DLA ORGANIZACJI TESTOWEJ
-- =========================================================

INSERT INTO organizacje (nazwa, subdomena, nip, email, telefon, miasto)
VALUES ('Demo EventFlow', 'demo', '0000000000', 'demo@eventflow.pl', '000000000', 'Warszawa');

INSERT INTO role (id_organizacji, nazwa, kolejnosc) VALUES
(1, 'Administrator', 1),
(1, 'Manager', 2),
(1, 'Handlowiec', 3),
(1, 'Magazynier', 4),
(1, 'Technik', 5);

INSERT INTO typy_wydarzen (id_organizacji, nazwa, kolejnosc) VALUES
(1, 'Konferencja/event do 3 techników', 1),
(1, 'Konferencja/event 3-10 techników', 2),
(1, 'Konferencja/event powyżej 10 techników', 3),
(1, 'Targi/Wystawy', 4),
(1, 'Koncert', 5),
(1, 'Wizja lokalna', 6),
(1, 'Zdalne nagranie', 7),
(1, 'Próba łączenia', 8),
(1, 'Przeglądy', 9),
(1, 'Wywóz śmieci', 10),
(1, 'Sprzątanie', 11),
(1, 'Przypomnienie', 12);

INSERT INTO statusy_wydarzen (id_organizacji, nazwa, kolor, kolejnosc) VALUES
(1, 'Nowe', '#64748b', 1),
(1, 'W przygotowaniu', '#3b82f6', 2),
(1, 'Zaakceptowane', '#22c55e', 3),
(1, 'W realizacji', '#f59e0b', 4),
(1, 'Zakończone', '#10b981', 5),
(1, 'Anulowane', '#ef4444', 6);

INSERT INTO typy_etapow (id_organizacji, nazwa, skrot, kolor, kolejnosc) VALUES
(1, 'Montaż', 'MON', '#3b82f6', 1),
(1, 'Event', 'EVE', '#22c55e', 2),
(1, 'Demontaż', 'DEM', '#ef4444', 3);

INSERT INTO statusy_ofert (id_organizacji, nazwa, kolor, kolejnosc) VALUES
(1, 'Robocza', '#64748b', 1),
(1, 'Wysłana', '#3b82f6', 2),
(1, 'Zaakceptowana', '#22c55e', 3),
(1, 'Odrzucona', '#ef4444', 4),
(1, 'Anulowana', '#991b1b', 5);

INSERT INTO statusy_wynajmow (id_organizacji, nazwa, kolor, kolejnosc) VALUES
(1, 'Planowany', '#64748b', 1),
(1, 'Zarezerwowany', '#3b82f6', 2),
(1, 'Wydany', '#f59e0b', 3),
(1, 'Częściowo zwrócony', '#a855f7', 4),
(1, 'Zwrócony', '#22c55e', 5),
(1, 'Anulowany', '#ef4444', 6);

INSERT INTO statusy_serwisu (id_organizacji, nazwa, kolor, kolejnosc) VALUES
(1, 'Zgłoszone - pilne', '#ef4444', 1),
(1, 'Zgłoszone - można używać', '#f59e0b', 2),
(1, 'W naprawie', '#3b82f6', 3),
(1, 'Zakończono naprawę', '#22c55e', 4);

INSERT INTO magazyny (id_organizacji, nazwa) VALUES
(1, 'Magazyn główny');

INSERT INTO cenniki (id_organizacji, nazwa, domyslny) VALUES
(1, 'Cennik podstawowy', TRUE);

INSERT INTO kategorie (id_organizacji, nazwa, kolor, kolejnosc) VALUES
(1, 'Multimedia', '#f59e0b', 1),
(1, 'Nagłośnienie', '#3b82f6', 2),
(1, 'Oświetlenie', '#ec4899', 3),
(1, 'Kratownice / Podesty / Elementy montażowe', '#22c55e', 4),
(1, 'Transport', '#64748b', 5),
(1, 'Obsługa', '#8b5cf6', 6),
(1, 'Nocleg', '#14b8a6', 7),
(1, 'Inne', '#71717a', 8);
