import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DefaultLayout from "@/layouts/default";
import { title, subtitle } from "@/components/primitives";
import { getUserData, isAdminUser } from "@/api/user";
import { adminGetChallenges, adminCreateChallenge, adminUpdateChallenge, adminDeleteChallenge, AdminChallengeInput } from "@/api/admin";

type ChallengeRow = AdminChallengeInput & { _id: string };

export default function AdminChallengesPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<ChallengeRow[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ChallengeRow | null>(null);
  const [form, setForm] = useState<AdminChallengeInput>({ goal: "", type: "wpm", targetValue: 60, period: "daily" });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<ChallengeRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getUserData().then((user) => {
      if (!isAdminUser(user)) {
        toast.error("You do not have permission to access this page.");
        navigate("/dashboard");
        return;
      }
      refresh();
    }).catch(() => {
      toast.error("Failed to load user data.");
      navigate("/signup");
    }).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    try {
      const data = await adminGetChallenges();
      setRows(data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load challenges");
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch = search ? (r.goal?.toLowerCase().includes(search.toLowerCase())) : true;
      const matchesType = typeFilter === "all" ? true : r.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [rows, search, typeFilter]);

  const openCreate = () => {
    setEditingRow(null);
    setForm({ goal: "", type: "wpm", targetValue: 60, period: "daily" });
    setIsModalOpen(true);
  };

  const openEdit = (row: ChallengeRow) => {
    setEditingRow(row);
    setForm({ goal: row.goal, type: row.type, targetValue: row.targetValue, period: row.period });
    setIsModalOpen(true);
  };

  const submitForm = async () => {
    try {
      if (editingRow) {
        await adminUpdateChallenge(editingRow._id, form);
        toast.success("Challenge updated");
      } else {
        await adminCreateChallenge(form);
        toast.success("Challenge created");
      }
      setIsModalOpen(false);
      refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save challenge");
    }
  };

  const deleteRow = (row: ChallengeRow) => {
    setRowToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const performDelete = async () => {
    if (!rowToDelete) return;
    try {
      setIsDeleting(true);
      await adminDeleteChallenge(rowToDelete._id);
      toast.success("Challenge deleted");
      setIsDeleteModalOpen(false);
      setRowToDelete(null);
      refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete challenge");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return null;

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className={title({ size: "sm" })}>Admin: Challenges</h1>
              <p className={subtitle()}>Create, read, update, delete challenges</p>
            </div>
            <div className="flex gap-2">
              <Button color="primary" onPress={openCreate}>New Challenge</Button>
              <Button variant="flat" onPress={() => navigate("/admin")}>Back</Button>
            </div>
          </div>

          <Card className="mb-4">
            <CardBody className="flex flex-col md:flex-row gap-3">
              <Input label="Search" placeholder="Challenge goal" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
              <Select
                label="Type Filter"
                className="w-80"
                selectedKeys={new Set([typeFilter])}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys as Set<string>)[0];
                  setTypeFilter(val);
                }}
              >
                <SelectItem key="all">All</SelectItem>
                <SelectItem key="wpm">WPM</SelectItem>
                <SelectItem key="accuracy">Accuracy</SelectItem>
                <SelectItem key="games_played">Games Played</SelectItem>
                <SelectItem key="wins">Wins</SelectItem>
                <SelectItem key="win_streak">Win Streak</SelectItem>
              </Select>
            </CardBody>
          </Card>

          <Table aria-label="Challenges table">
            <TableHeader>
              <TableColumn>Goal</TableColumn>
              <TableColumn>Period</TableColumn>
              <TableColumn>Type</TableColumn>
              <TableColumn>Target</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No challenges found"}>
              {filteredRows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell className="font-semibold">{row.goal}</TableCell>
                  <TableCell><Chip size="sm" variant="flat">{row.period}</Chip></TableCell>
                  <TableCell><Chip size="sm" variant="flat">{row.type}</Chip></TableCell>
                  <TableCell>{row.targetValue}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onPress={() => openEdit(row)}>Edit</Button>
                      <Button size="sm" color="danger" variant="flat" onPress={() => deleteRow(row)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">{editingRow ? "Edit Challenge" : "New Challenge"}</ModalHeader>
                  <ModalBody>
                    <Input label="Goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
                    <Select
                      label="Period"
                      selectedKeys={new Set([form.period])}
                      onSelectionChange={(keys) => {
                        const val = Array.from(keys as Set<string>)[0] as "daily" | "weekly";
                        setForm({ ...form, period: val });
                      }}
                    >
                      <SelectItem key="daily">Daily</SelectItem>
                      <SelectItem key="weekly">Weekly</SelectItem>
                    </Select>
                    <Select
                      label="Type"
                      selectedKeys={new Set([form.type])}
                      onSelectionChange={(keys) => {
                        const val = Array.from(keys as Set<string>)[0] as AdminChallengeInput["type"];
                        setForm({ ...form, type: val });
                      }}
                    >
                      <SelectItem key="wpm">WPM</SelectItem>
                      <SelectItem key="accuracy">Accuracy</SelectItem>
                      <SelectItem key="games_played">Games Played</SelectItem>
                      <SelectItem key="wins">Wins</SelectItem>
                      <SelectItem key="win_streak">Win Streak</SelectItem>
                    </Select>
                    <Input type="number" label="Target Value" value={String(form.targetValue)} onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })} />
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="flat" onPress={onClose}>Cancel</Button>
                    <Button color="primary" onPress={submitForm}>{editingRow ? "Save" : "Create"}</Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>

          {/* Delete confirmation modal */}
          <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                  <ModalBody>
                    <p>Are you sure you want to delete challenge with goal "{rowToDelete?.goal}"?</p>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="flat" onPress={onClose}>No</Button>
                    <Button color="danger" isDisabled={isDeleting} onPress={performDelete}>Yes, Delete</Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </motion.div>
      </div>
    </DefaultLayout>
  );
}