import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../constants/api";

export const destinationsApi = {
  getAll:      (params) => axiosClient.get(ENDPOINTS.DESTINATIONS.LIST, { params }),
  getFeatured: ()       => axiosClient.get(ENDPOINTS.DESTINATIONS.FEATURED),
  getRegions:  ()       => axiosClient.get(ENDPOINTS.DESTINATIONS.REGIONS),
  getBySlug:   (slug)   => axiosClient.get(ENDPOINTS.DESTINATIONS.DETAIL(slug)),
};
