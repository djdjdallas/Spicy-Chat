-- ============================================
-- POISE APP - SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this SQL in your new Supabase project's SQL Editor
-- Make sure to enable Row Level Security (RLS) policies after creation

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Stores user profile information, bio, preferences, and subscription status

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  full_name TEXT,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,

  -- Bio & Preferences
  bio TEXT,
  age INTEGER CHECK (age >= 18 OR age IS NULL),
  relationship_goal TEXT DEFAULT 'not_sure_yet',
  communication_style TEXT DEFAULT 'casual_friendly',
  interests TEXT[] DEFAULT '{}',
  hobbies TEXT[] DEFAULT '{}',
  values TEXT[] DEFAULT '{}',

  -- Profile Status
  is_profile_complete BOOLEAN DEFAULT FALSE,

  -- Subscription Fields
  has_subscription BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free',

  -- Message Tracking (for free tier limits)
  messages_used INTEGER DEFAULT 0,
  messages_reset_date TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- ============================================
-- 2. CONVERSATIONS TABLE
-- ============================================
-- Stores chat conversation metadata

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversation Info
  title TEXT DEFAULT 'New Chat',
  model TEXT DEFAULT 'dolphin-2.9.2-qwen2-72b',

  -- Partner Info (for conversation partners feature)
  partner_id TEXT,
  partner_name TEXT,
  partner_style TEXT,
  partner_goals TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- ============================================
-- 3. MESSAGES TABLE
-- ============================================
-- Stores individual chat messages

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message Content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Metadata (JSON for flexibility)
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user ON public.messages(user_id);

-- ============================================
-- 4. CONTEXT MEMORY TABLE
-- ============================================
-- Stores context chains for message threading

CREATE TABLE IF NOT EXISTS public.context_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  source_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,

  -- Context Data
  context_type TEXT DEFAULT 'continuation',
  context_data JSONB DEFAULT '{}',
  relevance_score FLOAT DEFAULT 1.0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_context_conversation ON public.context_memory(conversation_id);
CREATE INDEX IF NOT EXISTS idx_context_source_message ON public.context_memory(source_message_id);

-- ============================================
-- 5. SUBSCRIPTION PLANS TABLE
-- ============================================
-- Stores available subscription plans

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Pricing
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,

  -- Features
  features JSONB DEFAULT '[]',
  message_limit INTEGER, -- NULL = unlimited

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, message_limit, features) VALUES
  ('Free', 'free', 'Basic access with limited messages', 0, 0, 10, '["10 messages per day", "Basic AI responses"]'),
  ('Pro', 'pro', 'Unlimited messaging and premium features', 9.99, 99.99, NULL, '["Unlimited messages", "Conversation partners", "Priority support", "Advanced AI responses"]'),
  ('Premium', 'premium', 'Everything in Pro plus exclusive features', 19.99, 199.99, NULL, '["Everything in Pro", "Custom AI personalities", "Export conversations", "Early access to features"]')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 6. SUBSCRIPTIONS TABLE
-- ============================================
-- Stores user subscription records

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe Info
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,

  -- Subscription Details
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing', 'unpaid')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================
-- 7. SUBSCRIPTION EVENTS TABLE
-- ============================================
-- Logs subscription events for debugging/analytics

CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,

  -- Event Info
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  stripe_event_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON public.subscription_events(event_type);

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- CONVERSATIONS: Users can only access their own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (auth.uid() = user_id);

-- MESSAGES: Users can only access messages in their conversations
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.messages
  FOR DELETE USING (auth.uid() = user_id);

-- CONTEXT MEMORY: Users can access context for their conversations
CREATE POLICY "Users can view own context" ON public.context_memory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = context_memory.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own context" ON public.context_memory
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = context_memory.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own context" ON public.context_memory
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = context_memory.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- SUBSCRIPTIONS: Users can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- SUBSCRIPTION EVENTS: Users can view their own events
CREATE POLICY "Users can view own subscription events" ON public.subscription_events
  FOR SELECT USING (auth.uid() = user_id);

-- SUBSCRIPTION PLANS: Everyone can view plans (public)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- DONE! Your database is ready.
-- ============================================
-- After running this:
-- 1. Update your .env file with the new Supabase URL and anon key
-- 2. Test authentication flow
-- 3. Verify RLS policies are working correctly
