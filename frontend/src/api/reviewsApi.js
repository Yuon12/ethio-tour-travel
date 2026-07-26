import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../constants/api";

export const reviewsApi = {
  getReviews:      (params) => axiosClient.get(ENDPOINTS.REVIEWS.LIST_CREATE, { params }),
  createReview:    (data)   => axiosClient.post(ENDPOINTS.REVIEWS.LIST_CREATE, data),
  getTestimonials: ()       => axiosClient.get(ENDPOINTS.REVIEWS.TESTIMONIALS),
};
