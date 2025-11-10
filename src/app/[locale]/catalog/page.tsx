import CarCatalogPage from "@/components/catalog/CarCatalogPage";
import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/i18n-config";

export default async function Catalog({ params: { locale } }: { params: { locale: Locale } }) {
  const dictionary = await getDictionary(locale);
  return (
    <CarCatalogPage dictionary={dictionary} />
  );
}
