function connect_error(err) {
  if (err.message === "Invalid token") {
    console.log("Invalid token");
  } else if (err.message === "No token") {
    console.log("No token");
  } else {
    console.log(`Unknown error: ${err.message}`);
  }
}

export default connect_error;
