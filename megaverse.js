import fetch from 'node-fetch';
import axios from 'axios';

import Bottleneck from 'bottleneck';

async function getGoal() {
  try {
    const response = await fetch(
      'https://challenge.crossmint.io/api/map/d21b83e3-ef4a-4233-8eeb-835323ceae96/goal',
      {
        method: 'GET'
      }
    );
    const data = response.json();

    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  const { goal } = await getGoal();
  const requests = [];
  const limiter = new Bottleneck({ minTime: 1000, maxConcurrent: 1 });

  // FIRST EXCERCISE:

  // for (let i = 0; i < goal.length; i++) {
  //   for (let j = 0; j < goal[i].length; j++) {
  //     if (goal[i][j] === 'POLYANET') {
  //       try {
  //         const data = {
  //           candidateId: 'd21b83e3-ef4a-4233-8eeb-835323ceae96',
  //           row: i,
  //           column: j
  //         };
  //         const response = await fetch('https://challenge.crossmint.io/api/polyanets/', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json'
  //           },
  //           body: JSON.stringify(data)
  //         });
  //         console.log(response.status);
  //       } catch (error) {
  //         console.error('Error:', error);
  //       }
  //     }
  //   }
  // }

  console.log(goal);

  // SECOND EXCERCISE:

  for (let i = 0; i < goal.length; i++) {
    for (let j = 0; j < goal[i].length; j++) {
      if (goal[i][j] === 'POLYANET') {
        const data = {
          candidateId: 'd21b83e3-ef4a-4233-8eeb-835323ceae96',
          row: i,
          column: j
        };
        const request = () => axios.post('https://challenge.crossmint.io/api/polyanets/', data);

        requests.push(request);
      } else if (goal[i][j].includes('COMETH')) {
        const direction = goal[i][j].replace(/_COMETH/g, '').toLowerCase();
        const data = {
          candidateId: 'd21b83e3-ef4a-4233-8eeb-835323ceae96',
          row: i,
          column: j,
          direction
        };
        const request = () => axios.post('https://challenge.crossmint.io/api/comeths/', data);

        requests.push(request);
      } else if (goal[i][j].includes('SOLOON')) {
        const color = goal[i][j].replace(/_SOLOON/g, '').toLowerCase();
        const data = {
          candidateId: 'd21b83e3-ef4a-4233-8eeb-835323ceae96',
          row: i,
          column: j,
          color
        };
        const request = () => axios.post('https://challenge.crossmint.io/api/soloons/', data);

        requests.push(request);
      }
    }
  }

  const retryRequests = [];

  for (let i = 0; i < 3; i++) {
    try {
      const responses = await Promise.all(requests.map((request) => limiter.schedule(request)));
      console.log('All requests completed successfully!');
      return responses;
    } catch (error) {
      console.error(`Error on attempt ${i + 1}:`, error);
      retryRequests = error.reduce((acc, err, index) => {
        if (err instanceof axios.AxiosError) {
          acc.push(requests[index]);
        }
        return acc;
      }, []);
    }
  }

  console.error('Maximum number of retries reached!');
  return [];
}

main();
