import { useQuery } from "@tanstack/react-query";
import { destinationsApi } from "../api/destinationsApi";

export const useDestinations         = (params) => useQuery({ queryKey: ["destinations", params],   queryFn: () => destinationsApi.getAll(params).then(r => r.data),    staleTime: 10*60*1000 });
export const useFeaturedDestinations = ()       => useQuery({ queryKey: ["destinations","featured"], queryFn: () => destinationsApi.getFeatured().then(r => r.data),      staleTime: 10*60*1000 });
export const useDestinationDetail    = (slug)   => useQuery({ queryKey: ["destination", slug],       queryFn: () => destinationsApi.getBySlug(slug).then(r => r.data),    enabled: !!slug });
export const useRegions              = ()       => useQuery({ queryKey: ["regions"],                 queryFn: () => destinationsApi.getRegions().then(r => r.data),       staleTime: 30*60*1000 });
