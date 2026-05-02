import { useParams, Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CashflowTable } from '../components/CashflowTable';
import { getPropertyById, getCashflowsByPropertyId } from '../data/demoData';

export default function CashflowDetails() {
  const params = useParams<{ id: string }>();
  const propertyId = params.id || '';

  const property = getPropertyById(propertyId);
  const cashflows = getCashflowsByPropertyId(propertyId);

  if (!property) {
    return (
      <div className="p-6">
        <p className="text-red-500">Property not found</p>
        <Link href="/real-estate" className="text-blue-500 hover:underline">
          Back to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/real-estate/property/${propertyId}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Property</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-xl font-semibold text-gray-900">
            {property.name} - Cashflow Details
          </h1>
        </div>
      </div>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transaction History</span>
              <span className="text-sm font-normal text-gray-500">
                Q1 2025 - Q4 2025
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CashflowTable data={cashflows} propertyName={property.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
