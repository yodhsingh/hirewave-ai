'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Mail, Calendar, CheckCircle, Clock, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingParticles } from '@/components/FloatingParticles';

export default function CandidatesPage() {
  const { id } = useParams();
  const router = useRouter();

  const candidates = [
    { id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', status: 'Interview Scheduled', appliedDate: '2025-10-30' },
    { id: 2, name: 'Meera Patel', email: 'meera.patel@example.com', status: 'Shortlisted', appliedDate: '2025-10-28' },
    { id: 3, name: 'Rohit Verma', email: 'rohit.verma@example.com', status: 'Pending Review', appliedDate: '2025-10-25' },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <FloatingParticles />
      </div>

      {/* Header with inverted colors */}
      <nav className="relative z-10 border-b border-black/20 bg-white/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/hr/jobs')}
              className="flex items-center gap-2 text-black hover:text-gray-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </Button>
            <div className="h-6 w-px bg-black/20" />
            <h1 className="text-xl font-semibold text-black">
              Candidates for Job ID: {id}
            </h1>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-gray-700 hover:text-black transition"
          >
            <Home className="w-5 h-5 text-black" /> Home
          </Link>
        </div>
      </nav>

      {/* Main Section */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              Candidates List
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Showing {candidates.length} applicants for this job
            </p>
          </CardHeader>

          <CardContent>
            <div className="divide-y divide-white/10">
              {candidates.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="py-5 flex items-center justify-between hover:bg-white/5 px-4 rounded-xl transition-all"
                >
                  <div>
                    <h3 className="font-semibold text-white text-lg">{c.name}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white/60" /> {c.email}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-white/50" /> Applied on{' '}
                      {new Date(c.appliedDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium px-3 py-1 rounded-full border border-white/20 text-white bg-white/5">
                      {c.status}
                    </span>

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4 mr-1 text-white" />
                        Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-xl"
                      >
                        <Clock className="w-4 h-4 mr-1 text-white" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
