import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"
import { getAllRoomsInfo } from "../action/room"
import RoomList from "./room-list"

export default async function Rooms() {
  try {
    const response = await getAllRoomsInfo()

    if (!response.success || !response.data) {
      return <ErrorPage message={response.message ?? "Failed to load rooms"} />
    }
    console.log(response.data)

    return <RoomList roomsInfo={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
