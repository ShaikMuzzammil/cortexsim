"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  FolderOpen,
  AlertCircle,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface Experiment {
  id: string;
  name: string;
  description: string | null;
  config: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      const res = await fetch("/api/experiments");
      if (res.ok) {
        const data = await res.json();
        setExperiments(data);
      }
    } catch (error) {
      console.error("Failed to fetch experiments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/experiments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExperiments(experiments.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete experiment:", error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12"
        >
          <div>
            <h1 className="font-orbitron text-3xl font-bold text-gradient mb-2">
              Dashboard
            </h1>
            <p className="text-lavenderGray">
              Welcome back, {session?.user?.name || session?.user?.email}
            </p>
          </div>
          <Link href="/builder?new=true">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" />
              New Experiment
            </Button>
          </Link>
        </motion.div>

        {experiments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon/10 mb-4">
              <FolderOpen className="w-8 h-8 text-neon" />
            </div>
            <h3 className="font-orbitron text-xl font-bold text-softWhite mb-2">
              No Experiments Yet
            </h3>
            <p className="text-lavenderGray mb-6 max-w-md mx-auto">
              Create your first spiking neural network experiment and start exploring the brain.
            </p>
            <Link href="/builder?new=true">
              <Button variant="primary" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Experiment
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {experiments.map((experiment, index) => (
                <motion.div
                  key={experiment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card hover:border-neon/40 transition-all duration-300 group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-neon/10 text-neon">
                        <Brain className="w-5 h-5" />
                      </div>
                      <button
                        onClick={() => setDeleteId(experiment.id)}
                        className="p-2 rounded-lg hover:bg-spikeRed/20 text-lavenderGray hover:text-spikeRed transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-orbitron text-lg font-bold text-softWhite mb-1">
                        {experiment.name}
                      </h3>
                      <p className="text-lavenderGray text-sm line-clamp-2">
                        {experiment.description || "No description"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-lavenderGray">
                      <Clock className="w-3 h-3" />
                      {formatDate(experiment.updatedAt)}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex gap-2">
                      <Link href={`/builder?id=${experiment.id}`} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full gap-2">
                          <ExternalLink className="w-3 h-3" />
                          Open
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-sm mx-4 space-y-4"
            >
              <div className="flex items-center gap-3 text-spikeRed">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-orbitron text-lg font-bold">Delete Experiment?</h3>
              </div>
              <p className="text-lavenderGray text-sm">
                This action cannot be undone. The experiment and all its data will be permanently removed.
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  isLoading={isDeleting}
                  onClick={() => handleDelete(deleteId)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}