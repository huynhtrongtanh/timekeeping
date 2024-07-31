import React, { useState, useEffect } from 'react';
import { IoMdAddCircle, IoMdTrash } from 'react-icons/io';
import Swal from 'sweetalert2';
import DetailSalary from './detailSalary'; // Ensure the correct path and filename
import { apiGetAllSalary, apiAddTitleSalary, apiGetAllTitleSalary, apiDeleteTitleSalary } from './common/api';

const Salary = () => {
  const [titleSalaryData, setTitleSalaryData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchData();
    fetchAllSalary();
  }, []);


  const fetchData = async () => {
    try {
      const response = await apiGetAllTitleSalary();
      const data = response.data;
      setTitleSalaryData(data);

      // Populate unique sections
      const uniqueSections = [...new Set(data.map(item => item.section))];
      setSections(prevSections => [...new Set([...prevSections, ...uniqueSections])]);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const fetchAllSalary = async () => {
    try {
      const response = await apiGetAllSalary();
      const data = response.data;

      // Populate unique sections from this data
      const uniqueSections = [...new Set(data.map(item => item.section))];
      setSections(prevSections => [...new Set([...prevSections, ...uniqueSections])]);
    } catch (error) {
      console.error("Failed to fetch all salary data", error);
    }
  };

  const handleShowModal = () => {

    function htmlSwal() {
      return (
        <div>
          <span>s</span>
        </div>
      )
    }

    function convertToPlain(html) {

      // Create a new div element
      var tempDivElement = document.createElement("div");

      // Set the HTML content with the given value
      tempDivElement.innerHTML = html;

      // Retrieve the text property of the element 
      return tempDivElement.textContent || tempDivElement.innerText || "";
    }

    Swal.fire({
      title: 'Enter information',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-html',
        confirmButton: 'custom-swal-confirm',
        cancelButton: 'custom-swal-cancel'
      },
      html:
        `<input style="margin-bottom:15px" id="swal-input1" class="swal2-input custom-swal-input" placeholder="Table Name">
        <br/>
        <span>Chọn section<span>
        <select id="swal-input2" class="swal2-input custom-swal-input">
        <option value="">--Select Section--</option>` +
        sections.map(section => `<option value="${section}">${section}</option>`).join('') +
        `</select>
        <br/>
        <span>Từ ngày<span>
        <input id="swal-input3" class="swal2-input custom-swal-input" type="date" placeholder="Start Date">
        <br/>
        <span>Đến ngày<span>
        <input id="swal-input4" class="swal2-input custom-swal-input" type="date" placeholder="End Date">`,
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value,
          document.getElementById('swal-input3').value,
          document.getElementById('swal-input4').value
        ];
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const [name, section, fromDate, toDate] = result.value;
        if (name && section && fromDate && toDate) {
          const newData = { name, section, fromDate, toDate };
          try {
            await apiAddTitleSalary(newData); // Send data to API
            const updatedData = [...titleSalaryData, newData];
            setTitleSalaryData(updatedData);

            Swal.fire({
              icon: 'success',
              title: 'Saved successfully',
              showConfirmButton: false,
              timer: 1500
            });
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Error saving data',
              text: 'There was an error while saving the data. Please try again.',
            });
            console.error('Error saving data:', error);
          }
        }
      }
    });
  };

  const handleDeleteItem = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { _id } = titleSalaryData[index]; // Assumes the _id field is present
          await apiDeleteTitleSalary(_id);
          const newData = [...titleSalaryData];
          newData.splice(index, 1);
          setTitleSalaryData(newData);

          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error deleting data',
            text: 'There was an error while deleting the data. Please try again.',
          });
          console.error('Error deleting data:', error);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          'Your data is safe',
          'error'
        );
      }
    });
  };

  if (selectedId !== null) {
    return <DetailSalary data={titleSalaryData[selectedId]} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div>
      <h2>Doanh So Theo Thang</h2>
      <div className='d-flex mb-2'>
        <button type="button" className="btn btn-success" onClick={handleShowModal}>
          <IoMdAddCircle /> Add New
        </button>
      </div>
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">STT</th>
            <th scope="col">Tên bảng doanh số</th>
            <th scope="col">Section</th>
            <th scope="col">Date</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {titleSalaryData.length > 0 ? (
            titleSalaryData.map((data, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <span
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                    onClick={() => setSelectedId(index)}
                  >
                    {data.name}
                  </span>
                </td>
                <td>{data.section}</td>
                <td>{`${data.fromDate} - ${data.toDate}`}</td>
                <td>
                  <button type="button" className="btn btn-danger" onClick={() => handleDeleteItem(index)}>
                    <IoMdTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No data available. Click "Add New" to insert data.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Salary;
