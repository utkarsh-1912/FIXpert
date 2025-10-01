
import { FixpertIcon } from '@/components/icons';
import Image from 'next/image';
import FormLayout from '@/app/(auth)/layout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FormLayout>
        {children}
    </FormLayout>
  );
}
