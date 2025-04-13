export interface SearchRestaurantApiResponse {
  results: Results;
  api_version: string;
  results_available: number;
  results_returned: number;
  results_start: number;
}

interface Results {
  shop: Shop[];
}

interface Shop {
  id: string;
  name: string;
  logo_image?: string;
  name_kana?: string;
  address: string;
  station_name?: string;
  ktai_coupon?: "0" | "1";
  large_service_area?: Area;
  service_area?: Area;
  large_area?: Area;
  middle_area?: Area;
  small_area?: Area;
  lat: number;
  lng: number;
  genre: Genre;
  sub_genre?: Genre;
  budget?: Budget;
  budget_memo?: string;
  catch: string;
  capacity?: number;
  access: string;
  mobile_access?: string;
  urls: Urls;
  photo: Photo;
  open?: string;
  close?: string;
  party_capacity?: number;
  wifi?: string;
  wedding?: string;
  course?: string;
  free_drink?: string;
  free_food?: string;
  private_room?: string;
  horigotatsu?: string;
  tatami?: string;
  card?: string;
  non_smoking?: string;
  charter?: string;
  ktai?: string;
  parking?: string;
  barrier_free?: string;
  other_memo?: string;
  sommelier?: string;
  open_air?: string;
  show?: string;
  equipment?: string;
  karaoke?: string;
  band?: string;
  tv?: string;
  english?: string;
  pet?: string;
  child?: string;
  lunch?: string;
  midnight?: string;
  shop_detail_memo?: string;
  coupon_urls?: CouponUrls;
}

interface Area {
  code?: string;
  name?: string;
}

interface Genre {
  code?: string;
  name?: string;
  catch?: string;
}

interface Budget {
  code?: string;
  name?: string;
  average?: string;
}

interface Urls {
  pc?: string;
}

interface Photo {
  pc: PhotoUrl;
  mobile?: MobilePhotoUrl;
}

interface PhotoUrl {
  l?: string;
  m?: string;
  s?: string;
}

interface MobilePhotoUrl {
  l?: string;
  s?: string;
}

interface CouponUrls {
  pc?: string;
  sp?: string;
}

export interface GetLargeAreaCodeApiResponse {
  results: {
    api_version: string;
    results_available: number;
    results_returned: number;
    results_start: number;
    large_area: LargeArea[];
  };
}

interface LargeArea {
  code: string;
  name: string;
  service_area?: ServiceArea;
  large_service_area?: LargeServiceArea;
}

export interface GetMiddleAreaCodeApiResponse {
  results: {
    api_version: string;
    results_available: number;
    results_returned: number;
    results_start: number;
    middle_area: MiddleArea[];
  };
}

interface MiddleArea {
  code: string;
  name: string;
  large_area?: MiddleAreasLargeArea;
  service_area?: ServiceArea;
  large_service_area?: LargeServiceArea;
}

interface MiddleAreasLargeArea {
  code: string;
  name: string;
}

export interface GetSmallAreaCodeApiResponse {
  results: {
    api_version: string;
    results_available: number;
    results_returned: number;
    results_start: number;
    small_area: SmallArea[];
  };
}

interface SmallArea {
  code: string;
  name: string;
  middle_area?: SmallAreasMiddleArea;
  large_area?: SmallAreasLargeArea;
  service_area?: ServiceArea;
  large_service_area?: LargeServiceArea;
}

interface SmallAreasMiddleArea {
  code: string;
  name: string;
  large_area?: SmallAreasLargeArea;
  service_area?: ServiceArea;
  large_service_area?: LargeServiceArea;
}

interface SmallAreasLargeArea {
  code: string;
  name: string;
}

interface ServiceArea {
  code: string;
  name: string;
}

interface LargeServiceArea {
  code: string;
  name: string;
}
