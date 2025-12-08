-- Create portfolio_assets table to store user's holdings
CREATE TABLE public.portfolio_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(18, 8) NOT NULL CHECK (quantity > 0),
  avg_price DECIMAL(18, 4) NOT NULL CHECK (avg_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique symbol per user
  UNIQUE(user_id, symbol)
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (users can only access their own assets)
CREATE POLICY "Users can view their own assets" 
ON public.portfolio_assets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets" 
ON public.portfolio_assets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" 
ON public.portfolio_assets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" 
ON public.portfolio_assets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_portfolio_assets_updated_at
BEFORE UPDATE ON public.portfolio_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries by user
CREATE INDEX idx_portfolio_assets_user_id ON public.portfolio_assets(user_id);