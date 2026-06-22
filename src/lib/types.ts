export type RiskTier = "Green" | "Amber" | "Red" | "Unscored";

export interface ListingPublic {
  property_id: string;
  event_id: string;
  display_name: string;
  property_type: string | null;
  city: string | null;
  state: string | null;
  locality: string | null;
  area_sqft: number | null;
  bank_name: string | null;
  risk_tier_current: RiskTier | null;
  lat: number;
  lon: number;
  reserve_price_lakhs: number | null;
  emd_lakhs: number | null;
  auction_date: string | null;
  auction_type: string | null;
  possession_status: string | null;
  encumbrance_status: string | null;
  risk_tier: RiskTier | null;
  price_per_sqft: number | null;
  circle_rate_per_sqft: number | null;
  tags: string[] | null;
  source_url: string;
  source_code: string;
  scraped_at: string;
}

export interface ListingDetail extends ListingPublic {
  outstanding_loan_lakhs: number | null;
  notice_date: string | null;
  drt_case_number: string | null;
  completeness_score: number | null;
  extraction_confidence: number | null;
  analyst_notes: string | null;
  bank_property_id: string | null;
}

export interface Bbox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface ListingFilters {
  state?: string;
  city?: string;
  propertyType?: string;
  auctionType?: string;
  riskTier?: RiskTier;
  minPrice?: number;
  maxPrice?: number;
  minAuctionDate?: string;
  maxAuctionDate?: string;
  bbox?: Bbox;
}