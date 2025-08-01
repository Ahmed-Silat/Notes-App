import { useState } from "react";
import PasswordInput from "../../components/Input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
// import axios from "axios";
import { toast } from "react-toastify";
import { singnUp } from "../../Service/AuthService";
// import { useDispatch } from "react-redux";
// import { signInStart, signInSuccess } from "../../redux/user/userSlice";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!name) {
      setError("Please Enter Your Name");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please Enter a Valid Email Address");
      return;
    }

    if (!password) {
      setError("Please Enter The Password");
      return;
    }

    setError("");

    // sign up api

    try {
      // dispatch(signInStart);
      // const res = await axios.post(
      //   "http://localhost:3000/api/auth/signup",
      //   { username: name, email, password },
      //   { withCredentials: true }
      // );

      const res = await singnUp(name, email, password);

      if (res.data.success === false) {
        setEmail(res.data.message);
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);

      setError("");

      navigate("/login");
      // dispatch(signInSuccess(res.data));
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
      setError(error.message);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7">Sign Up</h4>

            <input
              type="text"
              placeholder="Name"
              className="input-box"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              SIGN UP
            </button>

            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <Link
                to={"/login"}
                className="font-medium text-[#2B85FF] underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
