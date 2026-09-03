-- Migration: Add tags column to moments table
-- Run this in Supabase SQL Editor:
ALTER TABLE public.moments ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
