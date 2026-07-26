import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../constants/api";

export const galleryApi = {
  getAlbums:    ()     => axiosClient.get(ENDPOINTS.GALLERY.ALBUMS),
  getFeatured:  ()     => axiosClient.get(ENDPOINTS.GALLERY.FEATURED),
  getAlbum:     (slug) => axiosClient.get(ENDPOINTS.GALLERY.DETAIL(slug)),
};
