

goal to implement :
create a vistior module to track the visitor records in hostel when they checkin when they so , visit to which student and reason to visit

vistot table that comes in my mind you can extend for better visuallizationa and optimization with indexes
id
organization fk
visitor name
relation
age
expected time to visit
studentname
reason
checkin time  full time with date
chekouttime
date in year-month-format
createdBY user fk
checkoutBy user kf
createAt
updatedAt

create a action to checkin visitoer and list them in visitors-management.tsx( Implment pagination , with perpage and filteratoion by date use shadcn date components calender ,)
chck and cal server action in vistors.tsx and pass to client component
after creatig visitor it can;t be edit only checkout and and delete 
show in tables and action checkout button and delete , checkout shuld write the time in db whenthe actiom is called










