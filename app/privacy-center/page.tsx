"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const supportEmail = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPPORT_EMAIL : undefined;

export default function PrivacyCenterPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Privacy Center</h1>
        <p className="mb-8 text-gray-400">How AuraCheck handles your data, images, and privacy.</p>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">What Stays in Your Browser</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
              <li>Your uploaded images (as data URLs)</li>
              <li>Your Aura Scores and reports</li>
              <li>Your audit history</li>
              <li>Your payment requests and unlock codes</li>
              <li>Your challenge entries and progress comparisons</li>
              <li>Your referral data and leads</li>
              <li>Your preferences and onboarding state</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">All data is stored locally using the browser&apos;s localStorage. Nothing is uploaded to an external server.</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">What Is Not Collected</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
              <li>AuraCheck does not collect your name, email, or phone number</li>
              <li>AuraCheck does not use cookies or tracking scripts</li>
              <li>AuraCheck does not send data to any external analytics service</li>
              <li>AuraCheck does not share data with third parties</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">Lead capture forms save data only to your local browser storage. No server receives it.</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">What AuraCheck Does Not Infer</h2>
            <p className="mb-3 text-sm text-gray-300">AuraCheck analyzes presentation signals — lighting, clarity, composition, grooming, outfit, and background. It does not infer or judge:</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
              <li>Caste, religion, ethnicity, or race</li>
              <li>Sexuality or gender identity</li>
              <li>Health, fitness, or medical conditions</li>
              <li>Exact income or financial status</li>
              <li>Intelligence, morality, or character</li>
              <li>Protected traits of any kind</li>
            </ul>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How Image Analysis Works</h2>
            <p className="text-sm text-gray-300">When you upload a photo, it is read entirely in your browser using a canvas element. Pixel data (brightness, contrast, color distribution, edge detection) is analyzed locally using TypeScript-based rules. No image data or pixel information is sent to any external AI service, server, or API.</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Manual Payment Limitations</h2>
            <p className="text-sm text-gray-300">The current MVP uses a manual UPI payment flow. AuraCheck does not automatically verify payments. Payment records are stored locally and are used to request an unlock code from the owner/admin. There is no automatic payment gateway integration.</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How to Delete Data</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-300">
              <li>Go to the <Link href="/data" className="text-purple-400 hover:underline">Data page</Link>.</li>
              <li>Choose the type of data you want to clear (audits, orders, analytics, or all data).</li>
              <li>Confirm the deletion.</li>
              <li>Data is permanently removed from localStorage.</li>
            </ol>
            <p className="mt-3 text-sm text-gray-400">You can also clear all browser data for this site through your browser settings.</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How to Export Data</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-300">
              <li>Go to the <Link href="/data" className="text-purple-400 hover:underline">Data page</Link>.</li>
              <li>Click &quot;Export as JSON&quot;.</li>
              <li>A JSON file containing all your AuraCheck data will be downloaded.</li>
              <li>You can reimport this file later to restore your data.</li>
            </ol>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Safety and Scoring Limitations</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
              <li>No external AI is used in this MVP. All analysis is local rule-based.</li>
              <li>No image is uploaded to a server.</li>
              <li>No automatic payment verification is performed.</li>
              <li>Scores are guidance, not objective truth.</li>
              <li>AuraCheck analyzes presentation signals, not human worth.</li>
            </ul>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/data"><Button variant="outline">Manage My Local Data</Button></Link>
          <Link href="/audit/new"><Button>Start Aura Check</Button></Link>
          {supportEmail && <a href={`mailto:${supportEmail}`}><Button variant="ghost">Contact Support</Button></a>}
        </div>
      </div>
    </Container>
  );
}
