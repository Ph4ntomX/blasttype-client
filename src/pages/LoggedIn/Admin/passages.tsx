import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {Select, SelectItem} from "@heroui/select";

import DefaultLayout from "@/layouts/default";
import { title, subtitle } from "@/components/primitives";
import { getUserData, isAdminUser } from "@/api/user";
import { adminGetPassages, adminCreatePassage, adminUpdatePassage, adminDeletePassage, AdminPassageInput } from "@/api/admin";

type PassageRow = AdminPassageInput & { _id: string; createdAt?: string };

export default function AdminPassagesPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<PassageRow[]>([]);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<PassageRow | null>(null);
  const [form, setForm] = useState<AdminPassageInput>({ text: "", difficulty: "easy" });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<PassageRow | null>(null);
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

  useEffect(() => {
    refresh(search, difficultyFilter);
  }, [search, difficultyFilter]);

  const refresh = async (search?: string, difficultyFilter?: string) => {
    if(difficultyFilter === "all") difficultyFilter = undefined;

    try {
      const data = await adminGetPassages(search, difficultyFilter);
      setRows(data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load passages");
    }
  };

  const openCreate = () => {
    setEditingRow(null);
    setForm({ text: "", difficulty: "easy" });
    setIsModalOpen(true);
  };

  const openEdit = (row: PassageRow) => {
    setEditingRow(row);
    setForm({ text: row.text, difficulty: row.difficulty });
    setIsModalOpen(true);
  };

  const submitForm = async () => {
    try {
      if (editingRow) {
        await adminUpdatePassage(editingRow._id, form);
        toast.success("Passage updated");
      } else {
        await adminCreatePassage(form);
        toast.success("Passage created");
      }
      setIsModalOpen(false);
      refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save passage");
    }
  };

  const deleteRow = (row: PassageRow) => {
    setRowToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const performDelete = async () => {
    if (!rowToDelete) return;
    try {
      setIsDeleting(true);
      await adminDeletePassage(rowToDelete._id);
      toast.success("Passage deleted");
      setIsDeleteModalOpen(false);
      setRowToDelete(null);
      refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete passage");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyColor = (d: string) => {
    if (d === "easy") return "success";
    if (d === "medium") return "primary";
    return "danger";
  };

  if (isLoading) return null;

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className={title({ size: "sm" })}>Admin: Passages</h1>
              <p className={subtitle()}>Create, read, update, delete passages</p>
            </div>
            <div className="flex gap-2">
              <Button color="primary" onPress={openCreate}>New Passage</Button>
              <Button variant="flat" onPress={() => navigate("/admin")}>Back</Button>
            </div>
          </div>

          <Card className="mb-4">
            <CardBody className="flex flex-col md:flex-row gap-3">
              <Input label="Search" placeholder="Title or text" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
              <Select
                label="Difficulty Filter"
                className="w-64"
                selectedKeys={new Set([difficultyFilter])}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys as Set<string>)[0];
                  setDifficultyFilter(val);
                }}
              >
                <SelectItem key="all">All</SelectItem>
                <SelectItem key="easy">Easy</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="hard">Hard</SelectItem>
              </Select>
            </CardBody>
          </Card>

          <Table aria-label="Passages table">
            <TableHeader>
              <TableColumn>Text</TableColumn>
              <TableColumn>Difficulty</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No passages found"}>
              {rows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell className="font-semibold">{row.text}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="dot" color={getDifficultyColor(row.difficulty)}>{row.difficulty}</Chip>
                  </TableCell>
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
                  <ModalHeader className="flex flex-col gap-1">{editingRow ? "Edit Passage" : "New Passage"}</ModalHeader>
                  <ModalBody>
                    <Input label="Text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} size="lg" />

                    <Select
                      label="Difficulty"
                      selectedKeys={new Set([form.difficulty])}
                      onSelectionChange={(keys) => {
                        const val = Array.from(keys as Set<string>)[0] as "easy" | "medium" | "hard";
                        setForm({ ...form, difficulty: val });
                      }}
                    >
                      <SelectItem key="easy">Easy</SelectItem>
                      <SelectItem key="medium">Medium</SelectItem>
                      <SelectItem key="hard">Hard</SelectItem>
                    </Select>
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
                    <p>Are you sure you want to delete passage "{rowToDelete?.text}"?</p>
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