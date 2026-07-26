import { useQuery } from "@tanstack/react-query";
import { blogApi } from "../api/blogApi";

export const usePosts      = (params) => useQuery({ queryKey: ["posts", params],      queryFn: () => blogApi.getPosts(params).then(r => r.data),      staleTime: 5*60*1000 });
export const usePost       = (slug)   => useQuery({ queryKey: ["post", slug],          queryFn: () => blogApi.getBySlug(slug).then(r => r.data),        enabled: !!slug });
export const useCategories = ()       => useQuery({ queryKey: ["blog-categories"],     queryFn: () => blogApi.getCategories().then(r => r.data),        staleTime: 30*60*1000 });
