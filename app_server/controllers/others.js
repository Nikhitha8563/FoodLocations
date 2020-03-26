/* GET homepage */
const about = (req, res) => {
  res.render('generic-text',
    {
        title: 'About Meal Loc8r',
      content: 'Contribution: \n Meal Loc8ator was created with the sole intention to contribute; to serve as critical resource during a time of uncertainty for families with children in need of meals throughout the city. \n \n \nThe Problem: \n During the school year, students typically have access to at least 2 meals on an average day. COVID-19 has not only disrupted the academic calendar of educational institutions but it has also force the doors of public schools to close and restricted access to food for those who rely on it. \n \n \nThe Solution: \n Kansas City has shown strength in community by collaborating and initiating local food drives for school children in need of meals. \n \n By utilizing technology and providing real time information, you will be able to use the Meal Loc8ator app to find providers throughout the metro who are offering free meal services to families with children in need'
    }
  );
};

module.exports = {
  about
};
