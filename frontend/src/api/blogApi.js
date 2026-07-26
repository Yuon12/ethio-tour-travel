import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../constants/api";

export const blogApi = {
  getPosts:      (params)     => axiosClient.get(ENDPOINTS.BLOG.POSTS, { params }),
  getBySlug:     (slug)       => axiosClient.get(ENDPOINTS.BLOG.DETAIL(slug)),
  postComment:   (slug, data) => axiosClient.post(ENDPOINTS.BLOG.COMMENT(slug), data),
  getCategories: ()           => axiosClient.get(ENDPOINTS.BLOG.CATEGORIES),
  getTags:       ()           => axiosClient.get(ENDPOINTS.BLOG.TAGS),
};
