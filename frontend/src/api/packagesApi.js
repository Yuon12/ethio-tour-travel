import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../constants/api";

export const packagesApi = {
  getAll:         (params) => axiosClient.get(ENDPOINTS.PACKAGES.LIST, { params }),
  getFeatured:    ()       => axiosClient.get(ENDPOINTS.PACKAGES.FEATURED),
  getBySlug:      (slug)   => axiosClient.get(ENDPOINTS.PACKAGES.DETAIL(slug)),
  getAvailability:(slug)   => axiosClient.get(ENDPOINTS.PACKAGES.AVAILABILITY(slug)),
};
