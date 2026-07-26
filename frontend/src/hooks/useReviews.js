import { useQuery } from "@tanstack/react-query";
import { reviewsApi } from "../api/reviewsApi";

export const useTestimonials = () => useQuery({ queryKey: ["testimonials"], queryFn: () => reviewsApi.getTestimonials().then(r => r.data), staleTime: 10*60*1000 });
export const useReviews = (params) => useQuery({ queryKey: ["reviews", params], queryFn: () => reviewsApi.getReviews(params).then(r => r.data), staleTime: 5*60*1000 });
