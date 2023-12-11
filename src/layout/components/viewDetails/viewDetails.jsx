import React from "react";
import {
  Button,
  Chip,
  Menu,
  MenuItem,
  Modal,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
function ViewDetails({ open, setOpen, data }) {
  console.log(data);
  let obj = {
    id: 1,
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  };
  return (
    <Stack>
      <Modal open={open} className="modal">
        <Stack
          width={500}
          bgcolor={"#fff"}
          borderRadius={1}
          padding={2}
          color={"#000"}
          maxHeight="90vh"
          overflow="scroll"
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={"1px solid #333"}
            paddingBottom={1}
          >
            <h3>Details</h3>
            <i
              class="fa-solid fa-xmark actionIcon"
              style={{ fontSize: 25 }}
              onClick={() => setOpen()}
            ></i>
          </Stack>
          <Stack margin="30px 0" direction="row">
            {data && (
              <>
                <Stack width="50%">
                  {Object.keys(obj)?.map((item, id) => (
                    <Stack
                      spacing={2}
                      direction="row"
                      justifyContent="space-between"
                      width="100%"
                      border="0.5px solid #999"
                      padding={1}
                    >
                      <p style={{ textTransform: "capitalize" }}>{item}</p>
                    </Stack>
                  ))}
                </Stack>
                <Stack width="50%">
                  {Object.values(obj)?.map((item, id) => (
                    <Stack
                      spacing={2}
                      direction="row"
                      justifyContent="space-between"
                      width="100%"
                      border="0.5px solid #999"
                      padding={1}
                    >
                      <p style={{ textTransform: "capitalize" }}>{item}</p>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
          <Stack spacing={2} direction="row" alignSelf="flex-end">
            <Button
              color="warning"
              style={{ outline: "none" }}
              onClick={() => setOpen()}
            >
              Close
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default ViewDetails;
