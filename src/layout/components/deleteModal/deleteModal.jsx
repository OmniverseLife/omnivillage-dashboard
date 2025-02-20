import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Modal,
    Stack,
} from "@mui/material";

export default function DeleteModal({ open, setOpen, onAgree }) {
    return (
        <Dialog onClose={setOpen} open={open}>
            <DialogTitle>Delete User</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this user?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    color="warning"
                    style={{ outline: "none" }}
                    onClick={() => setOpen()}
                >
                    Close
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    style={{ outline: "none" }}
                    onClick={onAgree}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
