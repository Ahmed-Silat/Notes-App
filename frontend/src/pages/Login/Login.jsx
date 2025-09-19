import { Card, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import FormInput from "../../components/Input/FormInput";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { login } from "../../Service/AuthService";
import { useDispatch } from "react-redux";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/user/userSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validation = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      console.log("Login form data", values);
      try {
        dispatch(signInStart);

        const res = await login(values.email, values.password);

        if (res.data.success === false) {
          toast.error(res.data.message);
          dispatch(signInFailure(res.data.message));
          return;
        }

        toast.success("Login successful 🎉");
        dispatch(signInSuccess(res.data));
        navigate("/");
      } catch (error) {
        // console.log("Login error:", error.response.data.message);
        toast.error(error.response.data.message || "Something went wrong");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#17313E] to-[#415E72] px-4">
      <Card className="w-full max-w-lg rounded-2xl shadow-2xl p-8 sm:p-10 bg-white">
        <h2 className="text-3xl font-bold text-center text-[#2B85FF] mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-500 text-center mb-6">Login to continue 👋</p>

        <form onSubmit={validation.handleSubmit} className="space-y-4">
          <FormInput
            name="email"
            label="Email"
            type="text"
            placeholder="example@email.com"
            value={validation.values.email}
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            error={validation.errors.email}
            touched={validation.touched.email}
            icon={<MailOutlined />}
          />

          <FormInput
            name="password"
            label="Password"
            type="password"
            placeholder="Enter password"
            value={validation.values.password}
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            error={validation.errors.password}
            touched={validation.touched.password}
            icon={<LockOutlined />}
          />

          <Button
            type="primary"
            htmlType="submit"
            loading={validation.isSubmitting}
            className="w-full mt-4 bg-[#2B85FF] hover:!bg-[#1E66CC] rounded-md py-2 text-lg"
          >
            Login
          </Button>

          <p className="text-sm text-center mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-[#2B85FF] underline font-medium">
              Sign Up
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Login;
