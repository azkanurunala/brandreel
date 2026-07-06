// Deklarasi tipe untuk import CSS (dipakai template Expo web).
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module "*.css";
