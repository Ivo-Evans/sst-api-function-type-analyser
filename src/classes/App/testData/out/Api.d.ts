import { default as default_export } from "backend/functions/users/post";
import { default as default_export_2 } from "backend/functions/users/get";
import { default as default_export_3 } from "backend/functions/users/put";

export interface Api {
  [index: `/users`]: {
    POST: ReturnType<typeof default_export>;
  }
  [index: `/users/${string}`]: {
    GET: ReturnType<typeof default_export_2>;
    PUT: ReturnType<typeof default_export_3>;
  }
}