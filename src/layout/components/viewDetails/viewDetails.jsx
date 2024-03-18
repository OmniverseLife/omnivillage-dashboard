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
  Typography,
} from "@mui/material";
import moment from "moment";
import { mediaURL } from "../../../axios/axiosInstance";

function ViewDetails({ open, setOpen, data, heading }) {
  let obj = {
    id: 1,
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  };
  return (
    // <Stack>
    <Modal open={open} className="modal">
      <Stack
        width="auto"
        maxWidth="90vw"
        bgcolor={"#fff"}
        borderRadius={1}
        padding={2}
        color={"#000"}
        maxHeight="90vh"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          borderBottom={"1px solid #333"}
          paddingBottom={1}
        >
          <h3>{heading} Details</h3>
          <i
            className="fa-solid fa-xmark actionIcon"
            style={{ fontSize: 25 }}
            onClick={() => setOpen()}
          ></i>
        </Stack>
        <Stack
          margin="20px 0"
          direction="row"
          flexWrap="wrap"
          justifyContent="flex-start"
          // maxHeight="90vh"
          overflow="scroll"
        >
          {data && (
            <>
              {/* <Stack width="100%"> */}
              {Object.keys(data)?.map((item) => (
                <Stack
                  spacing={1}
                  justifyContent="flex-start"
                  padding={1}
                  marginRight={3}
                  width="30%"
                  marginBottom={2}
                  key={item}
                >
                  <Typography
                    textTransform="capitalize"
                    fontSize={18}
                    fontFamily="inherit"
                  >
                    {item.replaceAll("_", " ").replaceAll("#", "-")}
                  </Typography>
                  {
                    // console.log(String(data[item]).includes("uploads"))

                    String(data[item]).includes("uploads/") ? (
                      <img
                        style={{
                          width: "95%",
                          objectFit: "contain",
                        }}
                        src={mediaURL + data[item]}
                        alt=""
                      />
                    ) : (
                      <Typography
                        textTransform="capitalize"
                        fontSize={16}
                        border="0.5px solid rgba(0,0,0,0.1)"
                        padding={1}
                        borderRadius={1}
                        fontFamily="inherit"
                        style={{
                          background: "rgb(250, 250, 250)",
                          minHeight: "41px",
                        }}
                      >
                        {String(item).includes("createdAt")
                          ? moment(data[item]).add(10, "days").calendar()
                          : data[item]}
                      </Typography>
                    )
                  }
                </Stack>
              ))}
              {/* </Stack> */}
            </>
          )}
        </Stack>
        <Stack spacing={2} direction="row" alignSelf="flex-end">
          <Button
            variant="outlined"
            color="warning"
            style={{ outline: "none" }}
            onClick={() => setOpen()}
          >
            Close
          </Button>
        </Stack>
      </Stack>
    </Modal>
    // {/* </Stack> */}
  );
}

export default ViewDetails;
