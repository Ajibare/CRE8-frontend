'use client';

// import Link from 'next/link';
import { Scale, Shield, FileText, Gavel } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link> */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms, Conditions & Legal Framework</h1>
          {/* <p className="text-white/80">FUNTECH Platform</p> */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Terms and Conditions Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-100 rounded-lg">
              <FileText className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility</h3>
              <p className="text-gray-600">
                Participation is open to individuals who meet program requirements and provide accurate information.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration & Participation</h3>
              <p className="text-gray-600">
                Registration may require a fee which covers participation and access to resources. Payment does not guarantee selection for rewards or grants.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Program Structure</h3>
              <p className="text-gray-600">
                Programs provide visibility, participation, learning access, and support consideration under defined guidelines.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Selection Process</h3>
              <p className="text-gray-600">
                Selection is based on structured evaluation including quality, participation, potential, and need. Decisions are final.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">No Guarantee of Reward</h3>
              <p className="text-gray-600">
                Participation does not guarantee financial or material support.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Use of Content</h3>
              <p className="text-gray-600">
                Participants grant FUNTECH rights to use submitted content for promotional purposes.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Code of Conduct</h3>
              <p className="text-gray-600">
                Participants must provide truthful information and avoid fraudulent activities.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Usage</h3>
              <p className="text-gray-600">
                Data collected is used for administration and communication only.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
              <p className="text-gray-600">
                FUNTECH is not liable for technical issues or selection outcomes.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Modifications</h3>
              <p className="text-gray-600">
                Terms may be updated at any time.
              </p>
            </div>
          </div>
        </section>

        {/* Legal Framework Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Gavel className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Government and Legal Compliance</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <Scale className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Lottery and Promotion Laws</h3>
              </div>
              <p className="text-gray-600">
                This initiative is not a lottery or game of chance. Selection is based on evaluation criteria.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Consumer Protection</h3>
              </div>
              <p className="text-gray-600">
                Participants are clearly informed about the nature of the program and benefits.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl shadow-md p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Data Protection</h3>
              </div>
              <p className="text-gray-600">
                Participant data is handled in accordance with applicable data protection regulations.
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-md p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-3">
                <Scale className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">Financial Compliance</h3>
              </div>
              <p className="text-gray-600">
                All transactions are recorded and managed under a registered business structure.
              </p>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl shadow-md p-6 border border-teal-100">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">Transparency</h3>
              </div>
              <p className="text-gray-600">
                All communications avoid misleading claims and ensure clarity of participation benefits.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            For questions about these terms, please contact us through funtechinnovations@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
