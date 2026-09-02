-- Schema for "Our Little Universe"

-- 1. Create Enums
CREATE TYPE moment_category AS ENUM ('first_trip', 'random');
CREATE TYPE media_type AS ENUM ('image', 'video');

-- 2. Create Tables
CREATE TABLE public.moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    caption TEXT,
    category moment_category NOT NULL,
    is_public BOOLEAN DEFAULT false,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE,
    type media_type NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    mood TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for `moments`
-- Public can read ONLY public moments
CREATE POLICY "Public moments are viewable by everyone" 
ON public.moments FOR SELECT 
USING (is_public = true);

-- Authenticated users have full access to moments
CREATE POLICY "Authenticated users can read all moments" 
ON public.moments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert moments" 
ON public.moments FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update moments" 
ON public.moments FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete moments" 
ON public.moments FOR DELETE 
TO authenticated 
USING (true);

-- 6. RLS Policies for `media`
-- Public can read media associated with public moments
CREATE POLICY "Public media viewable if moment is public" 
ON public.media FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.moments m 
        WHERE m.id = media.moment_id AND m.is_public = true
    )
);

-- Authenticated users have full access to media
CREATE POLICY "Authenticated users can read all media" 
ON public.media FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert media" 
ON public.media FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update media" 
ON public.media FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete media" 
ON public.media FOR DELETE 
TO authenticated 
USING (true);

-- 7. RLS Policies for `notes`
-- Notes are strictly private (only for authenticated users)
CREATE POLICY "Authenticated users have full access to notes" 
ON public.notes FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 8. Storage Policies for `memories` bucket
-- Public can read objects in 'memories' bucket
CREATE POLICY "Public read access on memories bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'memories');

-- Authenticated users can insert/update/delete objects in 'memories' bucket
CREATE POLICY "Authenticated users can manage memories bucket"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'memories')
WITH CHECK (bucket_id = 'memories');
