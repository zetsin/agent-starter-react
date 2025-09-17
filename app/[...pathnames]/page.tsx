import Link from 'next/link';
import { redirect } from 'next/navigation';
import path from 'path';
import { getPresignedUrl, listContents } from '@/app/actions/s3';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default async function Page({ params }: PageProps<'/[...pathnames]'>) {
  const { pathnames } = await params;
  const pathname = pathnames.join('/');

  const extname = path.extname(pathname);

  if (!extname) {
    const { files, folders } = await listContents(`${pathname}/`);

    return (
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <Breadcrumb>
            <BreadcrumbList>
              {pathnames.map((name, index) => {
                const href = '/' + pathnames.slice(0, index + 1).join('/');
                return (
                  <BreadcrumbItem key={href}>
                    {index < pathnames.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{name}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{name}</BreadcrumbPage>
                    )}
                    {index < pathnames.length - 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </CardHeader>
        <CardContent>
          <ul>
            {[...folders, ...files].map((key) => (
              <li key={key}>
                <Button variant="link" asChild>
                  <Link href={`/${key}`} target={path.extname(key) ? '_blank' : '_self'}>
                    {path.basename(key)}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  } else {
    const presignedUrl = await getPresignedUrl(pathname);

    redirect(presignedUrl);
  }
}
