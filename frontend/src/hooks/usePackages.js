import { useQuery } from "@tanstack/react-query";
import { packagesApi } from "../api/packagesApi";

export const usePackages         = (params) => useQuery({ queryKey: ["packages", params],    queryFn: () => packagesApi.getAll(params).then(r => r.data),         staleTime: 5*60*1000 });
export const useFeaturedPackages = ()       => useQuery({ queryKey: ["packages","featured"],  queryFn: () => packagesApi.getFeatured().then(r => r.data),          staleTime: 10*60*1000 });
export const usePackageDetail    = (slug)   => useQuery({ queryKey: ["package", slug],        queryFn: () => packagesApi.getBySlug(slug).then(r => r.data),        enabled: !!slug });


//export const usePackageAvailability = (slug)=> useQuery({ queryKey: ["availability", slug],   //queryFn: () => packagesApi.getAvailability(slug).then(r => r.data),  enabled: !!slug });
export const usePackageAvailability = (slug) => useQuery({ 
  queryKey: ["availability", slug], 
  queryFn: () => packagesApi.getAvailability(slug).then(r => r.data), 
  enabled: !!slug,
  // Normalize the data format here before it goes to the component
  select: (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results; // Fix for standard DRF pagination wrappers
    return []; // Fallback so .filter() never crashes your frontend layout
  }
});
