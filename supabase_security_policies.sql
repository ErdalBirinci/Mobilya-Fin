-- SUPABASE RLS & DATA LIFECYCLE POLICIES

-- 1. Tablo Oluşturma (Örnek)
-- CREATE TABLE services (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     type VARCHAR(10) NOT NULL,
--     customer_name VARCHAR(255),
--     customer_phone VARCHAR(50),
--     customer_address TEXT,
--     status VARCHAR(50),
--     driver_id UUID REFERENCES auth.users(id),
--     date DATE,
--     completed_at TIMESTAMP WITH TIME ZONE
-- );

-- 2. RLS'yi Aktifleştirme
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 3. Yönetici (Admin) için Politika
-- 'admin' rolündeki veya 'admin' tablosunda kaydı olan kullanıcılar tüm verilere erişebilir.
CREATE POLICY "Admins can view and edit all services" 
ON services
FOR ALL 
USING (
  auth.jwt() ->> 'role' = 'admin' 
  -- Veya auth.uid() in (select user_id from user_roles where role = 'admin')
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- 4. Şoför (Driver) için Politika
-- Şoförler sadece kendilerine atanmış (driver_id = auth.uid()) ve 
-- tarihi BUGÜN olan (date = current_date) servislere erişebilirler.
CREATE POLICY "Drivers can view their own services for today" 
ON services
FOR SELECT
USING (
  driver_id = auth.uid() 
  AND date = current_date
);

CREATE POLICY "Drivers can update their own services for today" 
ON services
FOR UPDATE
USING (
  driver_id = auth.uid() 
  AND date = current_date
)
WITH CHECK (
  driver_id = auth.uid() 
  AND date = current_date
);

-- ==========================================
-- VERİ ANONİMLEŞTİRME (DATA LIFECYCLE - CRON)
-- ==========================================

-- 1. Anonimleştirme Fonksiyonunu Oluştur
CREATE OR REPLACE FUNCTION anonymize_old_services()
RETURNS void AS $$
BEGIN
  UPDATE services
  SET 
    customer_name = 'Anonim Kullanıcı',
    customer_phone = '+358 00 000 0000',
    customer_address = 'Gizli Adres',
    notes = 'Kişisel veri gizliliği nedeniyle silinmiştir.'
  WHERE 
    (status = 'Tamamlandı' OR status = 'İptal Edildi')
    AND completed_at IS NOT NULL
    AND completed_at < now() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- 2. Supabase pg_cron eklentisi ile bu fonksiyonu her gün gece 02:00'da çalışacak şekilde programla
-- pg_cron extension'ının aktif olması gerekir: CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'anonymize-old-data-job', 
  '0 2 * * *', -- Her gün saat 02:00'da
  $$ SELECT anonymize_old_services(); $$
);
