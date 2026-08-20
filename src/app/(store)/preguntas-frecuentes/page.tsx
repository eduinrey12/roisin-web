import { getFaqs } from '@/services/catalog.service';
import { serializePlain } from '@/lib/utils';
import FaqsClientPage from './FaqsClientPage';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes | ROISIN Joyas',
  description:
    'Resuelve tus dudas sobre autenticidad de Plata 925, envíos a todo Ecuador, empaques de regalo, tiempos de entrega y garantía oficial de ROISIN.',
};

export default async function PreguntasFrecuentesPage() {
  const rawFaqs = await getFaqs();
  const faqs = serializePlain(rawFaqs);

  return <FaqsClientPage initialFaqs={faqs} />;
}
