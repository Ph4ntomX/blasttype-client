import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DefaultLayout from "@/layouts/default";
import { title, subtitle } from "@/components/primitives";
import { getUserData, isAdminUser, UserData } from "@/api/user";
import { adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser, AdminUserInput } from "@/api/admin";
import { Select, SelectItem } from "@heroui/select";

type UserRow = Pick<UserData, "_id" | "username" | "email" | "access_level">;

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<UserRow | null>(null);
  const [form, setForm] = useState<AdminUserInput>({ username: "", email: "", access_level: "user", password: "" });

  const [userID, setUserID] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<UserRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    getUserData().then((user) => {
      if (!isAdminUser(user)) {
        toast.error("You do not have permission to access this page.");
        navigate("/dashboard");
        return;
      }
      setUserID(user._id);
      refresh();
    }).catch(() => {
      toast.error("Failed to load user data.");
      navigate("/signup");
    }).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    try {
      const data = await adminGetUsers();
      setRows((data || []).map((u: any) => ({ _id: u._id || Date.now().toString(), username: u.username, email: u.email, access_level: u.access_level })));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to load users");
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => search ? (r.username?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())) : true);
  }, [rows, search]);

  const openCreate = () => {
    setEditingRow(null);
    setForm({ username: "", email: "", access_level: "user", password: "" });
    setIsModalOpen(true);
  };

  const openEdit = (row: UserRow) => {
    setEditingRow(row);
    setForm({ username: row.username, email: row.email, access_level: row.access_level });
    setIsModalOpen(true);
  };

  const submitForm = async () => {
    try {
      if (editingRow) {
        const updatedUser = await adminUpdateUser(editingRow._id, { username: form.username, email: form.email, access_level: form.access_level });
        setRows(rows.map((r) => (r._id === updatedUser._id ? { ...r, username: form.username, email: form.email, access_level: form.access_level } : r)));
        toast.success(`User ${updatedUser.username} updated`);
      } else {
        const newUser = await adminCreateUser(form);
        setRows([...rows, { _id: newUser._id || Date.now().toString(), username: form.username, email: form.email, access_level: form.access_level }]);
        toast.success(`User ${form.username} created`);
      }
      setIsModalOpen(false);
      refresh();
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || `Failed to save user ${form.username}`);
    }
  };

  const deleteRow = (row: UserRow) => {
    setRowToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const performDelete = async () => {
    if (!rowToDelete) return;
    try {
      setIsDeleting(true);
      await adminDeleteUser(rowToDelete._id);
      setRows(rows.filter((r) => r._id !== rowToDelete._id));
      toast.success(`User ${rowToDelete.username} deleted`);
      setIsDeleteModalOpen(false);
      setRowToDelete(null);
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || `Failed to delete user ${rowToDelete.username}`);
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
              <h1 className={title({ size: "sm" })}>Admin: Users</h1>
              <p className={subtitle()}>Create, read, update, delete users</p>
            </div>
            <div className="flex gap-2">
              <Button color="primary" onPress={openCreate}>New User</Button>
              <Button variant="flat" onPress={() => navigate("/admin")}>Back</Button>
            </div>
          </div>

          <Card className="mb-4">
            <CardBody className="flex gap-3">
              <Input label="Search" placeholder="Username or email" value={search} onChange={(e) => setSearch(e.target.value)} />
            </CardBody>
          </Card>

          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>Username</TableColumn>
              <TableColumn>Email</TableColumn>
              <TableColumn>Role</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No users found"}>
              {filteredRows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell className="font-semibold">{row.username}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color={row.access_level === "admin" ? "warning" : "default"}>{row.access_level}</Chip>
                  </TableCell>
                  <TableCell>
                    {row._id !== userID && (
                      <div className="flex gap-2">
                        <Button size="sm" onPress={() => openEdit(row)}>Edit</Button>
                        <Button size="sm" color="danger" variant="flat" onPress={() => deleteRow(row)}>Delete</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">{editingRow ? "Edit User" : "New User"}</ModalHeader>
                  <ModalBody>
                    <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                    <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    {!editingRow && (
                      <Input type="password" label="Password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    )}

                    <Select
                      label="User Role"
                      selectedKeys={new Set([form.access_level])}
                      onSelectionChange={(keys) => {
                        const val = Array.from(keys as Set<string>)[0] as "user" | "admin";
                        setForm({ ...form, access_level: val });
                      }}
                    >
                      <SelectItem key="user">User</SelectItem>
                      <SelectItem key="admin">Admin</SelectItem>
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
                    <p>Are you sure you want to delete user "{rowToDelete?.username}"?</p>
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