import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import CreateRide from './components/CreateRide';
import BookRide from './components/BookRide';
import MyCreated from './components/MyCreated';
import MyBookings from './components/MyBookings';
import Chat from './components/Chat';
import ManageRequests from './components/ManageRequests';
import ViewPassengers from './components/ViewPassengers';
import Inbox from './components/Inbox';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/create" element={<CreateRide />} />
        <Route path="/book" element={<BookRide />} />
        <Route path="/created" element={<MyCreated />} />
        <Route path="/booked" element={<MyBookings />} />
        <Route path="/chat/:rideId/:otherUserId" element={<Chat />} />
        <Route path="/manage-requests/:rideId" element={<ManageRequests />} />
        <Route path="/passengers/:rideId" element={<ViewPassengers />} />
        <Route path="/inbox" element={<Inbox />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

